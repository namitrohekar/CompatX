package com.namit.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.namit.dtos.profile.ProfileUpdateDTO;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.AppUserProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor

public class UserProfileController {

    private final AppUserProfileService profileService;

    // Get current user's profile
    @GetMapping("/user/profile")
    public ResponseEntity<?> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId();
        return profileService.getMyProfile(userId);
    }

    // Create or update current user's profile
    @PostMapping("/user/profile")
    public ResponseEntity<?> createOrUpdateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileUpdateDTO profileDTO) {

        Long userId = userDetails.getUserId();
        return profileService.createOrUpdateMyProfile(userId, profileDTO);
    }

    // Update current user's profile
    @PutMapping("/user/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileUpdateDTO profileDTO) {

        Long userId = userDetails.getUserId();
        return profileService.createOrUpdateMyProfile(userId, profileDTO);
    }

    // Delete current user's profile
    @DeleteMapping("/user/profile")
    public ResponseEntity<?> deleteProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getUserId();
        return profileService.deleteMyProfile(userId);
    }
}
