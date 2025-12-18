package com.namit.dtos.auth;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

	private String username;
	@Size(min = 6, message = "Password must be at least 6 characters")
	private String password;
	private boolean rememberMe = false;

}
