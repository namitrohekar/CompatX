package com.namit.mappers;

import org.springframework.stereotype.Component;

import com.namit.dtos.profile.ProfileDTO;
import com.namit.dtos.profile.ProfileResponseDTO;
import com.namit.dtos.profile.ProfileUpdateDTO;
import com.namit.models.AppUserProfile;

@Component
public class ProfileMapper {

	
	public ProfileResponseDTO toResponseDTO(AppUserProfile profile) {
		if ( profile == null) {
			return null;
		}
		
		return ProfileResponseDTO.builder()
				.profileId(profile.getProfileId())
				.userId(profile.getUser() != null ? profile.getUser().getUserId() : null)
				.fullName(profile.getFullName())
				.address(profile.getAddress())
				.city(profile.getCity())
				.state(profile.getState())
				.phone(profile.getPhone())
				.alternatePhone(profile.getAlternatePhone())
				.landmark(profile.getLandmark())
				.pincode(profile.getPincode())
				.username(profile.getUser() != null ? profile.getUser().getUserName() : null)
				.email(profile.getUser() !=null ? profile.getUser().getEmail() : null)
				.createdAt(profile.getCreatedAt())
				.updatedAt(profile.getUpdatedAt())
				.build();
		}
	
	
	
	
	
	public void updateEntityFromDTO ( AppUserProfile profile , ProfileUpdateDTO dto) {
		
		if (dto.getFullName() != null) {
			profile.setFullName(dto.getFullName());
		}
		if (dto.getAddress() != null) {
            profile.setAddress(dto.getAddress());
        }
        if (dto.getCity() != null) {
            profile.setCity(dto.getCity());
        }
        if (dto.getState() != null) {
            profile.setState(dto.getState());
        }
        if (dto.getPincode() != null) {
            profile.setPincode(dto.getPincode());
        }
        if (dto.getPhone() != null) {
            profile.setPhone(dto.getPhone());
        }
        if (dto.getAlternatePhone() != null) {
            profile.setAlternatePhone(dto.getAlternatePhone());
        }
        if (dto.getLandmark() != null) {
            profile.setLandmark(dto.getLandmark());
        }
        
	}
	
	
	public AppUserProfile toEntiy(ProfileDTO dto) {
		if (dto == null) {
			return null;
			
		}
		
		
		AppUserProfile profile = new AppUserProfile();
		  profile.setFullName(dto.getFullName());
	        profile.setAddress(dto.getAddress());
	        profile.setCity(dto.getCity());
	        profile.setState(dto.getState());
	        profile.setPincode(dto.getPincode());
	        profile.setPhone(dto.getPhone());
	        profile.setAlternatePhone(dto.getAlternatePhone());
	        profile.setLandmark(dto.getLandmark());
	        
	        return profile;
	}
	
}
