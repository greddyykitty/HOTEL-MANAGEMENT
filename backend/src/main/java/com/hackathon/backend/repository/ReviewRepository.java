package com.hackathon.backend.repository;

import com.hackathon.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    Long countByHotelId(Long hotelId);
}
