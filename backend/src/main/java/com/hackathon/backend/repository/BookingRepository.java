package com.hackathon.backend.repository;

import com.hackathon.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByRoomIdAndStatus(Long roomId, Booking.BookingStatus status);

    // Check for any overlapping CONFIRMED bookings for a given room
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId AND " +
           "b.status = 'CONFIRMED' AND " +
           "NOT (b.checkOut <= :checkIn OR b.checkIn >= :checkOut)")
    long countOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Double getTotalRevenue();

    long countByStatus(Booking.BookingStatus status);
}
