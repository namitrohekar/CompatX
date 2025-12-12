package com.namit.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.namit.dtos.profile.ProfileResponseDTO;
import com.namit.dtos.profile.ProfileUpdateDTO;
import com.namit.mappers.ProfileMapper;
import com.namit.models.AppUser;
import com.namit.models.AppUserProfile;
import com.namit.repositories.AppUserProfileRepository;
import com.namit.repositories.AppUserRepository;
import com.namit.responsewrapper.MyResponseWrapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppUserProfileService {

    private final AppUserRepository userRepository;
    private final AppUserProfileRepository profileRepository;
    private final MyResponseWrapper responseWrapper;
    private final ProfileMapper profileMapper;

    // ============ USER ENDPOINTS ============

    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyProfile(Long userId) {
        Optional<AppUserProfile> profileOpt = profileRepository.findByUserUserId(userId);

        if (!profileOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "Profile not found. Please create your profile first.",
                null,
                HttpStatus.NOT_FOUND
            );
        }

        ProfileResponseDTO responseDTO = profileMapper.toResponseDTO(profileOpt.get());
        return responseWrapper.universalResponse(
            "Profile retrieved successfully",
            responseDTO,
            HttpStatus.OK
        );
    }

    @Transactional
    public ResponseEntity<?> createOrUpdateMyProfile(Long userId, ProfileUpdateDTO profileDTO) {
        Optional<AppUser> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "User not found",
                null,
                HttpStatus.NOT_FOUND
            );
        }

        AppUser user = userOpt.get();
        Optional<AppUserProfile> existingProfileOpt = profileRepository.findByUserUserId(userId);

        AppUserProfile profile;
        String message;

        if (existingProfileOpt.isPresent()) {
            profile = existingProfileOpt.get();
            profileMapper.updateEntityFromDTO(profile, profileDTO);
            message = "Profile updated successfully";
        } else {
            profile = new AppUserProfile();
            profileMapper.updateEntityFromDTO(profile, profileDTO);
            profile.setUser(user);
            message = "Profile created successfully";
        }

        AppUserProfile savedProfile = profileRepository.save(profile);
        ProfileResponseDTO responseDTO = profileMapper.toResponseDTO(savedProfile);

        return responseWrapper.universalResponse(
            message,
            responseDTO,
            HttpStatus.OK
        );
    }

    @Transactional
    public ResponseEntity<?> deleteMyProfile(Long userId) {
        Optional<AppUserProfile> profileOpt = profileRepository.findByUserUserId(userId);

        if (!profileOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "Profile not found",
                null,
                HttpStatus.NOT_FOUND
            );
        }

        profileRepository.delete(profileOpt.get());
        return responseWrapper.universalResponse(
            "Profile deleted successfully",
            null,
            HttpStatus.OK
        );
    }

    // ============ ADMIN ENDPOINTS ============

    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllProfiles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AppUserProfile> profilePage = profileRepository.findAll(pageable);

        List<ProfileResponseDTO> responseDTOs = profilePage.getContent()
                .stream()
                .map(profileMapper::toResponseDTO)
                .collect(Collectors.toList());

        return responseWrapper.universalResponse(
            "Profiles retrieved successfully",
            responseDTOs,
            HttpStatus.OK
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getProfileByUserId(Long userId) {
        Optional<AppUserProfile> profileOpt = profileRepository.findByUserUserId(userId);

        if (!profileOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "Profile not found for user ID: " + userId,
                null,
                HttpStatus.NOT_FOUND
            );
        }

        ProfileResponseDTO responseDTO = profileMapper.toResponseDTO(profileOpt.get());
        return responseWrapper.universalResponse(
            "Profile retrieved successfully",
            responseDTO,
            HttpStatus.OK
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> searchProfiles(String city, String state, String pincode) {
        List<AppUserProfile> profiles;

        if (city != null && !city.isEmpty()) {
            profiles = profileRepository.findByCityContainingIgnoreCase(city);
        } else if (state != null && !state.isEmpty()) {
            profiles = profileRepository.findByStateContainingIgnoreCase(state);
        } else if (pincode != null && !pincode.isEmpty()) {
            profiles = profileRepository.findByPincode(pincode);
        } else {
            profiles = profileRepository.findAll();
        }

        List<ProfileResponseDTO> responseDTOs = profiles.stream()
                .map(profileMapper::toResponseDTO)
                .collect(Collectors.toList());

        return responseWrapper.universalResponse(
            "Search completed. Found " + responseDTOs.size() + " profiles",
            responseDTOs,
            HttpStatus.OK
        );
    }

    @Transactional
    public ResponseEntity<?> adminUpdateProfile(Long userId, ProfileUpdateDTO profileDTO) {
        Optional<AppUser> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "User not found",
                null,
                HttpStatus.NOT_FOUND
            );
        }

        Optional<AppUserProfile> profileOpt = profileRepository.findByUserUserId(userId);
        if (!profileOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "Profile not found for this user",
                null,
                HttpStatus.NOT_FOUND
            );
        }

        AppUserProfile profile = profileOpt.get();
        profileMapper.updateEntityFromDTO(profile, profileDTO);
        AppUserProfile updatedProfile = profileRepository.save(profile);

        ProfileResponseDTO responseDTO = profileMapper.toResponseDTO(updatedProfile);
        return responseWrapper.universalResponse(
            "Profile updated successfully by admin",
            responseDTO,
            HttpStatus.OK
        );
    }

    @Transactional
    public ResponseEntity<?> adminDeleteProfile(Long userId) {
        Optional<AppUserProfile> profileOpt = profileRepository.findByUserUserId(userId);

        if (!profileOpt.isPresent()) {
            return responseWrapper.universalResponse(
                "Profile not found for user ID: " + userId,
                null,
                HttpStatus.NOT_FOUND
            );
        }

        profileRepository.delete(profileOpt.get());
        return responseWrapper.universalResponse(
            "Profile deleted successfully by admin",
            null,
            HttpStatus.OK
        );
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getProfileStats() {
        long totalProfiles = profileRepository.count();
        long totalUsers = userRepository.count();
        long usersWithoutProfile = totalUsers - totalProfiles;

        var stats = new java.util.HashMap<String, Object>();
        stats.put("totalProfiles", totalProfiles);
        stats.put("totalUsers", totalUsers);
        stats.put("usersWithoutProfile", usersWithoutProfile);
        stats.put("profileCompletionRate", totalUsers > 0 ? (totalProfiles * 100.0 / totalUsers) : 0);

        return responseWrapper.universalResponse(
            "Profile statistics retrieved successfully",
            stats,
            HttpStatus.OK
        );
    }
}
