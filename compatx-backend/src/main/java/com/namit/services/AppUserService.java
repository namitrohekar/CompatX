package com.namit.services;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.namit.models.AppUser;
import com.namit.repositories.AppUserRepository;
import com.namit.responsewrapper.MyResponseWrapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserService {

	private final PasswordEncoder passwordEncoder;

	private final AppUserRepository userRepository;

	private final MyResponseWrapper responseWrapper;

	public ResponseEntity<?> register(AppUser appUser) {

		Optional<AppUser> userExist = userRepository.findByUserName(appUser.getUserName());
		if (userExist.isPresent()) {

			return responseWrapper.universalResponse("User already exits ", null, HttpStatus.CONFLICT);

		}

		// Check if email already exists
		if (userRepository.existsByEmail(appUser.getEmail())) {
			return responseWrapper.universalResponse("Email already exists", null, HttpStatus.CONFLICT);
		}

		appUser.setPassword(passwordEncoder.encode(appUser.getPassword()));

		AppUser savedUser = userRepository.save(appUser);
		return responseWrapper.universalResponse("User registered successfully", savedUser, HttpStatus.CREATED);

	}

}
