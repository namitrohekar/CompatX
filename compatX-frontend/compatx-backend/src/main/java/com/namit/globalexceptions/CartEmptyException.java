package com.namit.globalexceptions;

public class CartEmptyException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public CartEmptyException(String message) {
        super(message);
    }
}
