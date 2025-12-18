# CompatX API Testing Guide - Postman Collection

## 📥 How to Import

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `CompatX_Postman_Collection.json` or click **Upload Files**
4. Click **Import**

## 🚀 Setup Before Testing

### 1. Start Your Spring Boot Application
```bash
./mvnw spring-boot:run
```
OR
```bash
mvn spring-boot:run
```

### 2. Database Setup
Make sure MySQL is running on port 3307 with database `compatx_db`

### 3. Verify Application is Running
Check: http://localhost:8080/api/v1/products/search?keyword=test

Should return: Empty array with 200 OK

---

## 📋 Test Flow (Recommended Order)

### Phase 1: Setup (Create Users & Categories)

1. **Register User** → Creates first user (ID will be 1)
   - Response: 201 Created
   - Save the `userId` from response

2. **Register Admin** → Creates admin user (ID will be 2)
   - Response: 201 Created
   - Save the `userId` from response

3. **Create Profile** → Create profile for user ID 1
   - Use userId = 1 from registration
   - Response: 201 Created

4. **Create Categories** → Create all 3 categories
   - Laptop (ID will be 1)
   - Macbook (ID will be 2)
   - Accessories (ID will be 3)
   - Response: 201 Created for each

### Phase 2: Create Products

5. **Create Product - Laptop Battery**
   - categoryId = 1, userId = 2
   - Response: 201 Created
   - Save productId from response

6. **Create Product - MacBook Charger**
   - categoryId = 2, userId = 2
   - Response: 201 Created

7. **Create Product - Laptop Cooler**
   - categoryId = 3, userId = 2
   - Response: 201 Created

### Phase 3: Read Operations

8. **Get All Categories (Admin)**
   - Response: 200 OK with list of categories

9. **Get All Products (Admin)**
   - Response: 200 OK with all products

10. **Get Product By ID**
    - Use productId = 1 from earlier
    - Response: 200 OK

11. **Get Products By Category**
    - categoryId = 1
    - Response: 200 OK with laptop products

12. **Search Products**
    - Try: "battery", "macbook", "Dell"
    - Response: 200 OK with search results

### Phase 4: Update Operations

13. **Update Product**
    - productId = 1
    - Change price, stock, or name
    - Response: 200 OK

14. **Update Product with Category Change**
    - productId = 1, categoryId = 3
    - Response: 200 OK

15. **Update Profile**
    - Use existing profile
    - Change address or phone
    - Response: 200 OK (if exists) or 201 Created (if new)

### Phase 5: Error Handling Tests

16. **Register Duplicate Username**
    - Try registering same username again
    - Response: 409 Conflict

17. **Register Duplicate Email**
    - Same email, different username
    - Response: 409 Conflict

18. **Create Duplicate Category**
    - Try "Laptop" again
    - Response: 409 Conflict

19. **Create Product - Invalid Category**
    - categoryId = 999
    - Response: 404 Not Found

20. **Create Product - Invalid User**
    - userId = 999
    - Response: 404 Not Found

21. **Get Non-existent Product**
    - productId = 999
    - Response: 404 Not Found

22. **Delete Non-existent Category**
    - categoryId = 999
    - Response: 404 Not Found

### Phase 6: Validation Tests

23. **Register User - Missing Fields**
    - Only send userName
    - Response: 400 Bad Request (validation errors)

24. **Register User - Invalid Email**
    - email = "invalid-email"
    - Response: 400 Bad Request

25. **Create Product - Negative Price**
    - price = -10.00
    - Response: 400 Bad Request

26. **Create Product - Zero Price**
    - price = 0.0
    - Response: 400 Bad Request (price must be > 0)

27. **Create Product - Negative Stock**
    - stock = -5
    - Response: 400 Bad Request

28. **Create Profile - Missing Phone**
    - Only send address
    - Response: 400 Bad Request

### Phase 7: Cleanup (Optional)

29. **Delete Product**
    - productId = 1
    - Response: 200 OK

30. **Delete Category**
    - categoryId = 1
    - Response: 200 OK

---

## ✅ Expected Responses

### Successful Responses
- **201 Created**: Resource created successfully
- **200 OK**: Operation successful

### Error Responses
- **400 Bad Request**: Validation errors or invalid input
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (username, email, category)

---

## 🔍 What to Check

### Success Indicators
✅ All POST requests return 201 Created  
✅ All GET requests return 200 OK with data  
✅ Search returns matching products (case insensitive)  
✅ Updates return 200 OK with updated data  
✅ Deletes return 200 OK  

### Error Handling Indicators
✅ Duplicate username returns 409 Conflict  
✅ Duplicate email returns 409 Conflict  
✅ Invalid IDs return 404 Not Found  
✅ Validation errors return 400 Bad Request  
✅ Empty lists return 200 OK with empty array (not 404)  

### Data Integrity
✅ Category names are unique  
✅ Product prices are positive (> 0)  
✅ Product stock is non-negative  
✅ User emails are valid and unique  
✅ Relations are preserved (category, user on products)  

---

## 📝 Notes

1. **User IDs**: Start from 1, increment by 1
2. **Category IDs**: Start from 1, increment by 1
3. **Product IDs**: Start from 1, increment by 1
4. **Profile IDs**: Start from 1, increment by 1

5. **Timestamps**: Check that `createdAt` and `updatedAt` are automatically set

6. **Relations**: 
   - Products are linked to categories
   - Products are linked to users (admin who created)
   - Profiles are linked to users (OneToOne)

---

## 🐛 Troubleshooting

### Application won't start
- Check MySQL is running
- Check port 3307 is not in use
- Check database `compatx_db` exists
- Check `application.properties` credentials

### All requests return 404
- Check application is running on port 8080
- Check base URL: `http://localhost:8080/api/v1`

### Validation not working
- Make sure `@Valid` annotations are on controllers
- Check request has `Content-Type: application/json` header

### JPA errors
- Check `ddl-auto=update` in application.properties
- Restart application to regenerate schema

---

## 🎯 Quick Test Checklist

- [ ] Register user successfully
- [ ] Register duplicate username → 409
- [ ] Register duplicate email → 409
- [ ] Create profile
- [ ] Create 3 categories
- [ ] Create duplicate category → 409
- [ ] Create products with valid data
- [ ] Create product with invalid category → 404
- [ ] Get all products → 200 OK
- [ ] Search products by keyword → 200 OK
- [ ] Update product → 200 OK
- [ ] Delete product → 200 OK
- [ ] Get non-existent product → 404
- [ ] Create product with negative price → 400
- [ ] Create product with zero price → 400
- [ ] Missing required fields → 400

---

**Happy Testing! 🚀**

If everything passes, your backend is ready for frontend integration!










