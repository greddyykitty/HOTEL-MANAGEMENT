package com.hackathon.backend.repository;

import com.hackathon.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    // Rooms with at least 1 available slot and matching hotel
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.availableRooms > 0")
    List<Room> findAvailableRoomsByHotel(@Param("hotelId") Long hotelId);

    // Search by price range
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND " +
           "(:minPrice IS NULL OR r.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.price <= :maxPrice)")
    List<Room> findByHotelAndPriceRange(
            @Param("hotelId") Long hotelId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice);
}
