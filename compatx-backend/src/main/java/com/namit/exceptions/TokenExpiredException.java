package com.namit.exceptions;

/**
 * Exception thrown when a refresh token has expired
 * Should result in 401 Unauthorized response
 */
public class TokenExpiredException extends RuntimeException {

    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
