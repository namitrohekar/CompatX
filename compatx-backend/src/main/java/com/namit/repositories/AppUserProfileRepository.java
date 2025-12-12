package com.namit.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.namit.models.AppUserProfile;

@Repository
public interface AppUserProfileRepository extends JpaRepository<AppUserProfile, Long> {

    Optional<AppUserProfile> findByUserUserId(Long userId);

    // Search by city
    List<AppUserProfile> findByCityContainingIgnoreCase(String city);

    // Search by state
    List<AppUserProfile> findByStateContainingIgnoreCase(String state);

    // Search by pincode
    List<AppUserProfile> findByPincode(String pincode);

    // Search by phone
    Optional<AppUserProfile> findByPhone(String phone);

    // Check if profile exists for user
    boolean existsByUserUserId(Long userId);

    // Custom query to search by multiple criteria
    @Query("SELECT p FROM AppUserProfile p WHERE " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.state) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.phone LIKE CONCAT('%', :searchTerm, '%')")
    List<AppUserProfile> searchProfiles(@Param("searchTerm") String searchTerm);

    // Get profiles by city and state
    List<AppUserProfile> findByCityAndState(String city, String state);
}
