package com.namit.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data

@AllArgsConstructor
public class LoginResponse {

	
	private String token;
	private String role;
	private String username;
	
	
}
