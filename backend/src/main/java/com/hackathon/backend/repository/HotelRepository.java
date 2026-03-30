package com.hackathon.backend.repository;

import com.hackathon.backend.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN Room r ON r.hotel.id = h.id WHERE " +
           "(:location IS NULL OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minRating IS NULL OR h.rating >= :minRating) AND " +
           "(:minPrice IS NULL OR r.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.price <= :maxPrice) AND " +
           "(:amenity IS NULL OR LOWER(h.amenities) LIKE LOWER(CONCAT('%', :amenity, '%')))")
    List<Hotel> searchHotels(
            @Param("location") String location,
            @Param("minRating") Double minRating,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("amenity") String amenity);
}
