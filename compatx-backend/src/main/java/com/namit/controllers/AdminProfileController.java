package com.namit.controllers;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.namit.dtos.profile.ProfileUpdateDTO;
import com.namit.services.AppUserProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor

public class AdminProfileController {

    private final AppUserProfileService profileService;

    // Get all profiles with pagination
    @GetMapping("/admin/profiles")
    public ResponseEntity<?> getAllProfiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return profileService.getAllProfiles(page, size);
    }

    // Get profile by user ID
    @GetMapping("/admin/profiles/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Long userId) {
        return profileService.getProfileByUserId(userId);
    }

    // Search profiles
    @GetMapping("/admin/profiles/search")
    public ResponseEntity<?> searchProfiles(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String pincode) {

        return profileService.searchProfiles(city, state, pincode);
    }

    // Update any user's profile (Admin)
    @PutMapping("/admin/profiles/user/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody ProfileUpdateDTO profileDTO) {

        return profileService.adminUpdateProfile(userId, profileDTO);
    }

    // Delete any user's profile (Admin)
    @DeleteMapping("/admin/profiles/user/{userId}")
    public ResponseEntity<?> deleteUserProfile(@PathVariable Long userId) {
        return profileService.adminDeleteProfile(userId);
    }

    // Get profile statistics
    @GetMapping("/admin/profiles/stats")
    public ResponseEntity<?> getProfileStats() {
        return profileService.getProfileStats();
    }
}
