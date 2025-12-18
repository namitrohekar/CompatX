package com.namit.security.details;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.namit.models.AppUser;


import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor

public class CustomUserDetails implements UserDetails {
	
	
	private static final long serialVersionUID = 1L;
	private final AppUser user;
	

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		
		return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
	}

	@Override
	public String getPassword() {
		
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		
		return user.getUserName();
		
	}
	
	

    @Override
    public boolean isEnabled() {
        return user.getIsActive();  
    }

    public Long getUserId() {
        return user.getUserId();
    }
	
    
    
    
    
    @Override
    public boolean isAccountNonExpired() {
        return true; // Logic to be implemented
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Logic to be implemented
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;// Logic to be implemented
    }
    
    
    

}
