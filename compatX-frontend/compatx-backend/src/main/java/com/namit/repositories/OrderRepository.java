package com.namit.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.namit.enums.OrderStatus;
import com.namit.models.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

	// User scoped

	Optional<Order> findByOrderIdAndUser_UserId(Long orderId, Long userId);

	List<Order> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

	Page<Order> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	List<Order> findByUser_UserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status);

	Long countByUser_UserId(Long userId);

	// Admin scoped

	List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

	Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

	Long countByStatus(OrderStatus status);

	// Admin-filtered queries (multi-tenant)
	// Get orders containing products owned by specific admin

	@Query("SELECT DISTINCT o FROM Order o " +
			"JOIN o.orderItems oi " +
			"JOIN oi.product p " +
			"WHERE p.user.userId = :userId")
	Page<Order> findOrdersForAdmin(@Param("userId") Long userId, Pageable pageable);

	@Query("SELECT DISTINCT o FROM Order o " +
			"JOIN o.orderItems oi " +
			"JOIN oi.product p " +
			"WHERE p.user.userId = :userId AND o.status = :status")
	Page<Order> findOrdersForAdminByStatus(
			@Param("userId") Long userId,
			@Param("status") OrderStatus status,
			Pageable pageable);

	// Count queries for admin stats
	@Query("SELECT COUNT(DISTINCT o) FROM Order o " +
			"JOIN o.orderItems oi " +
			"JOIN oi.product p " +
			"WHERE p.user.userId = :userId")
	Long countOrdersForAdmin(@Param("userId") Long userId);

	@Query("SELECT COUNT(DISTINCT o) FROM Order o " +
			"JOIN o.orderItems oi " +
			"JOIN oi.product p " +
			"WHERE p.user.userId = :userId AND o.status = :status")
	Long countOrdersForAdminByStatus(
			@Param("userId") Long userId,
			@Param("status") OrderStatus status);

	// Revenue calculation for admin
	@Query("SELECT COALESCE(SUM(o.totalAmount), 0.0) FROM Order o " +
			"JOIN o.orderItems oi " +
			"JOIN oi.product p " +
			"WHERE p.user.userId = :userId AND o.status = 'DELIVERED'")
	Double getTotalRevenueForAdmin(@Param("userId") Long userId);

	// Fetch and Search

	@Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product WHERE o.orderId = :orderId")
	Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

}
