# Authentication Resilience - Implementation Plan

## Problem Summary

Users are logged out instantly when backend crashes, returns errors, or restarts. This is caused by the axios interceptor treating ALL errors (including server errors) as authentication failures.

## User Review Required

> [!IMPORTANT]
> This plan will modify critical authentication code. Changes include:
> - Axios interceptor logic (error handling)
> - Auth store rehydration behavior
> - Backend refresh endpoint error handling
> 
> **Risk**: If implemented incorrectly, could break login/logout functionality.

> [!WARNING]
> Testing is CRITICAL. All acceptance criteria must be verified before deployment.

---

## Proposed Changes

### Backend Changes

#### [MODIFY] [AuthController.java](file:///c:/Users/namit/CompatX-Security/CompatX/src/main/java/com/namit/controllers/AuthController.java)

**Current Issue** (lines 62-81):
- Throws generic exceptions that return 500
- Frontend can't distinguish invalid token from server error

**Changes**:
```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestParam("refreshToken") String refreshTokenStr) {
    try {
        // 1. Look up the refresh token
        RefreshToken refreshToken = refreshTokenService.getByToken(refreshTokenStr);
        
        // 2. Verify expiration
        refreshTokenService.verifyExpiration(refreshToken);
        
        // 3. Generate new access token
        String newAccessToken = jwtUtil.generateToken(
            refreshToken.getUser().getUserName(),
            refreshToken.getUser().getRole().name()
        );
        
        return ResponseEntity.ok(
            new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),
                refreshToken.getUser().getRole().name(),
                refreshToken.getUser().getUserName()
            )
        );
    } catch (TokenExpiredException e) {
        // Return 401 for expired tokens
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Refresh token expired", "code", "TOKEN_EXPIRED"));
    } catch (InvalidTokenException e) {
        // Return 401 for invalid tokens
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Invalid refresh token", "code", "INVALID_TOKEN"));
    } catch (Exception e) {
        // Return 500 for actual server errors
        log.error("Error refreshing token", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Server error", "code", "SERVER_ERROR"));
    }
}
```

**Why**: Frontend can now distinguish between auth failures (401) and server errors (500).

---

#### [CREATE] Custom Exception Classes

**New Files**:
- `TokenExpiredException.java`
- `InvalidTokenException.java`

**Purpose**: Proper exception handling for token validation.

---

### Frontend Changes

#### [MODIFY] [axiosClient.js](file:///c:/Users/namit/CompatX-Security/CompatX-frontend/src/lib/axiosClient.js)

**Critical Fix #1: Refresh Error Handling** (lines 58-76)

**Before** (BROKEN):
```javascript
try {
    const res = await axios.get(`http://localhost:8080/api/v1/auth/refresh`, {
        params: { refreshToken },
    });
    // ... success
} catch (err) {
    console.error("❌ Token refresh failed. Logging out...", err.message);
    logout();  // ⚠️ LOGS OUT ON ANY ERROR
    return Promise.reject(err);
}
```

**After** (FIXED):
```javascript
try {
    const res = await axios.get(`http://localhost:8080/api/v1/auth/refresh`, {
        params: { refreshToken },
    });
    // ... success
} catch (err) {
    // Only logout on actual auth failures (401/403)
    if (err.response?.status === 401 || err.response?.status === 403) {
        console.error("❌ Refresh token invalid/expired. Logging out...");
        logout();
        return Promise.reject(err);
    }
    
    // For server errors or network errors, don't logout
    console.warn("⚠️ Refresh failed due to server error. Will retry...");
    
    // Show user-friendly message
    toast.error("Server temporarily unavailable. Retrying...");
    
    // Retry with exponential backoff
    return retryWithBackoff(() => axiosClient(original), 3);
}
```

---

**Critical Fix #2: Add Retry Logic**

**New Function** (add before interceptors):
```javascript
// Retry helper with exponential backoff
const retryWithBackoff = async (fn, retriesLeft = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft === 0) {
            throw error;
        }
        
        // Don't retry on auth errors (401, 403)
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw error;
        }
        
        // Retry on 5xx or network errors
        console.log(`Retrying... (${retriesLeft} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retriesLeft - 1, delay * 2);
    }
};
```

---

**Critical Fix #3: Concurrent Refresh Guard**

**Add at top of file**:
```javascript
// Global refresh promise to prevent concurrent refresh requests
let refreshPromise = null;

// Reset refresh promise
const resetRefreshPromise = () => {
    refreshPromise = null;
};
```

**Update interceptor** (lines 46-76):
```javascript
if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    
    // If refresh is already in progress, wait for it
    if (refreshPromise) {
        await refreshPromise;
        // Retry original request with new token
        const newToken = useAuthStore.getState().accessToken;
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
    }
    
    // Start new refresh
    refreshPromise = (async () => {
        try {
            const { refreshToken, updateAccessToken, logout } = useAuthStore.getState();
            
            if (!refreshToken) {
                logout();
                throw new Error("No refresh token");
            }
            
            const res = await axios.get(
                `http://localhost:8080/api/v1/auth/refresh`,
                { params: { refreshToken } }
            );
            
            const newToken = res.data.accessToken;
            updateAccessToken(newToken);
            return newToken;
        } catch (err) {
            // Handle error as shown in Fix #1
            // ...
        } finally {
            resetRefreshPromise();
        }
    })();
    
    const newToken = await refreshPromise;
    original.headers.Authorization = `Bearer ${newToken}`;
    return axiosClient(original);
}
```

---

#### [MODIFY] [useAuthStore.js](file:///c:/Users/namit/CompatX-Security/CompatX-frontend/src/stores/useAuthStore.js)

**Critical Fix #4: Rehydration Error Handling** (lines 51-73)

**Before** (BROKEN):
```javascript
rehydrateAccessToken: async () => {
    // ... code ...
    try {
        const res = await axios.post(...);
        updateAccessToken(res.data.accessToken);
    } catch (error) {
        console.error(" Refresh failed. Logging out...", error);
        logout();  // ⚠️ LOGS OUT ON PAGE LOAD IF BACKEND DOWN
    }
},
```

**After** (FIXED):
```javascript
rehydrateAccessToken: async () => {
    const { accessToken, refreshToken, updateAccessToken, logout } = get();
    
    if (accessToken) return; // already valid
    if (!refreshToken) return; // nothing to do
    
    try {
        const res = await axios.post(
            "http://localhost:8080/api/v1/auth/refresh",
            null,
            { params: { refreshToken } }
        );
        
        updateAccessToken(res.data.accessToken);
        console.log(" Access token refreshed on page load");
    } catch (error) {
        // Only logout on auth failures (401/403)
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.error(" Refresh token invalid. Logging out...");
            logout();
            return;
        }
        
        // For server errors, keep user logged in
        console.warn("⚠️ Could not refresh on page load (server error). User stays logged in.");
        // User can still navigate and will get fresh token on next API call
    }
},
```

---

#### [CREATE] Error Notification Component

**New File**: `src/components/ServerErrorBanner.jsx`

**Purpose**: Show user-friendly message when server is down

```javascript
import { AlertCircle } from 'lucide-react';

export default function ServerErrorBanner({ show, onRetry }) {
    if (!show) return null;
    
    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Server temporarily unavailable. Your session is still active.</span>
                </div>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-white text-yellow-600 rounded hover:bg-gray-100"
                >
                    Retry
                </button>
            </div>
        </div>
    );
}
```

---

## Verification Plan

### Automated Tests

**Backend Tests** (create new test file):
```java
@Test
void refreshToken_withExpiredToken_returns401() {
    // Test that expired tokens return 401, not 500
}

@Test
void refreshToken_withInvalidToken_returns401() {
    // Test that invalid tokens return 401, not 500
}

@Test
void refreshToken_withServerError_returns500() {
    // Test that actual server errors return 500
}
```

**Frontend Tests** (create new test file):
```javascript
describe('Axios Interceptor', () => {
    it('should not logout on 500 error', async () => {
        // Mock 500 response
        // Verify logout not called
    });
    
    it('should logout on 401 refresh failure', async () => {
        // Mock 401 response
        // Verify logout called
    });
    
    it('should retry on network error', async () => {
        // Mock network error
        // Verify retry attempted
    });
});
```

### Manual Testing

#### Test 1: Backend Restart
**Steps**:
1. Login to application
2. Navigate to any page
3. Kill backend process (`Ctrl+C`)
4. Try to perform an action (e.g., view orders)
5. Restart backend
6. Retry the action

**Expected**:
- ✅ User sees "Server temporarily unavailable" message
- ✅ User is NOT logged out
- ✅ After backend restarts, action succeeds
- ✅ User session persists

---

#### Test 2: 5xx Error
**Steps**:
1. Login to application
2. Temporarily modify backend endpoint to return 500
3. Try to access that endpoint
4. Restore endpoint

**Expected**:
- ✅ User sees error message
- ✅ User is NOT logged out
- ✅ User can retry

---

#### Test 3: Expired Access Token
**Steps**:
1. Login to application
2. Wait for access token to expire (or manually expire it)
3. Make an API request

**Expected**:
- ✅ Frontend automatically refreshes token
- ✅ Original request succeeds
- ✅ User is NOT logged out

---

#### Test 4: Invalid Refresh Token
**Steps**:
1. Login to application
2. Manually invalidate refresh token in database
3. Make an API request (will trigger refresh)

**Expected**:
- ✅ Refresh fails with 401
- ✅ User IS logged out (correct behavior)
- ✅ Redirected to login page

---

#### Test 5: Page Refresh During Backend Downtime
**Steps**:
1. Login to application
2. Kill backend
3. Refresh browser page
4. Restart backend

**Expected**:
- ✅ User stays logged in (rehydration fails gracefully)
- ✅ User can navigate app
- ✅ Next API call triggers successful refresh

---

#### Test 6: Concurrent Requests
**Steps**:
1. Login with expired access token
2. Trigger multiple API calls simultaneously

**Expected**:
- ✅ Only ONE refresh request to backend
- ✅ All pending requests wait for refresh
- ✅ All requests succeed after refresh

---

#### Test 7: Stripe Redirect
**Steps**:
1. Login to application
2. Go to checkout
3. Select Stripe payment
4. Complete payment and return

**Expected**:
- ✅ User stays logged in after redirect
- ✅ No session loss

---

## Implementation Order

1. ✅ **Backend**: Update `AuthController.java` refresh endpoint error handling
2. ✅ **Backend**: Create custom exception classes
3. ✅ **Frontend**: Fix axios interceptor refresh error handling
4. ✅ **Frontend**: Add retry logic with exponential backoff
5. ✅ **Frontend**: Add concurrent refresh guard
6. ✅ **Frontend**: Fix auth store rehydration
7. ✅ **Frontend**: Create server error banner component
8. ✅ **Testing**: Run all manual tests
9. ✅ **Documentation**: Update with findings and solutions

---

## Rollback Plan

If issues arise:
1. Revert frontend changes first (axios interceptor)
2. Revert backend changes if needed
3. Tag stable commit before starting: `git tag auth-stable-before-fix`

---

## Security Considerations

✅ **No security regressions**:
- Still logout on invalid/expired refresh tokens
- Still validate tokens on backend
- Still use HTTPS in production
- Still use HttpOnly cookies for refresh tokens (if applicable)

⚠️ **New considerations**:
- Retry logic could amplify DDoS if not rate-limited
- Ensure exponential backoff prevents server overload

---

## Success Criteria

- [ ] Backend restart: User stays logged in
- [ ] 5xx error: User sees error, not logged out
- [ ] Invalid refresh token: User is logged out (correct)
- [ ] Network error: User sees retry, not logged out
- [ ] Page refresh during downtime: User stays logged in
- [ ] Concurrent requests: Single refresh call
- [ ] Stripe redirect: Session persists
- [ ] All manual tests pass
- [ ] No security regressions
