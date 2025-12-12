package com.namit.exceptions;

/**
 * Exception thrown when a refresh token is invalid or not found
 * Should result in 401 Unauthorized response
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
