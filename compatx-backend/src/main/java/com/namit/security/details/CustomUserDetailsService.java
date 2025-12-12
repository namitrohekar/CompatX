package com.namit.security.details;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.namit.models.AppUser;
import com.namit.repositories.AppUserRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	
	
	private final AppUserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		AppUser user = userRepository.findByUserName(username)
				.orElseThrow(() -> new UsernameNotFoundException( " User not found :" + username));
		
		return new  CustomUserDetails(user);
	}
	
	

}
