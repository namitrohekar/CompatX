package com.namit.controllers;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.namit.models.AppUser;
import com.namit.services.AppUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")

public class AppUserController {
	
	private final AppUserService userService;
	
	
	
	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody AppUser appUser){
		
		return userService.register(appUser);
	}

}
