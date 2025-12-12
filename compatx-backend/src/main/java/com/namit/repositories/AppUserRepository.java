package com.namit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.namit.models.AppUser;

import java.util.Optional;


@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
	
	
	Optional<AppUser> findByUserName(String userName);
	
	Optional<AppUser> findByEmail(String email);
	
	boolean existsByEmail(String email);

}
