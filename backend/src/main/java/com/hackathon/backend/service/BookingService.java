package com.hackathon.backend.service;

import com.hackathon.backend.model.Booking;
import com.hackathon.backend.model.Room;
import com.hackathon.backend.model.User;
import com.hackathon.backend.payload.request.BookingRequest;
import com.hackathon.backend.payload.response.BookingResponse;
import com.hackathon.backend.repository.BookingRepository;
import com.hackathon.backend.repository.RoomRepository;
import com.hackathon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Business Logic:
     * 1. Validate user is authenticated (done via controller)
     * 2. Validate dates
     * 3. Check room exists and has availableRooms > 0
     * 4. Check no overlapping CONFIRMED bookings
     * 5. Create booking record
     * 6. Decrement availableRooms count
     * 7. Generate booking reference ID
     */
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest req) {
        // ── 1. Validate dates ──────────────────────────────────────────────
        if (req.getCheckIn() == null || req.getCheckOut() == null) {
            throw new RuntimeException("Check-in and check-out dates are required");
        }
        if (!req.getCheckIn().isBefore(req.getCheckOut())) {
            throw new RuntimeException("Check-out date must be after check-in date");
        }

        // ── 2. Find room ───────────────────────────────────────────────────
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + req.getRoomId()));

        // ── 3. Check availability count & capacity ─────────────────────────
        if (room.getAvailableRooms() <= 0) {
            throw new RuntimeException("No rooms available for room type: " + room.getRoomType());
        }
        int requestedGuests = req.getGuests() != null ? req.getGuests() : 1;
        if (requestedGuests > room.getCapacity()) {
            throw new RuntimeException("Number of guests exceeds the maximum room capacity of " + room.getCapacity());
        }

        // ── 4. Check for date overlaps ─────────────────────────────────────
        long overlapping = bookingRepository.countOverlappingBookings(
                req.getRoomId(), req.getCheckIn(), req.getCheckOut());
        if (overlapping >= room.getAvailableRooms()) {
            throw new RuntimeException("Room not available for the selected dates");
        }

        // ── 5. Find user ───────────────────────────────────────────────────
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // ── 6. Calculate total price ───────────────────────────────────────
        long nights = ChronoUnit.DAYS.between(req.getCheckIn(), req.getCheckOut());
        if (nights <= 0) throw new RuntimeException("Invalid date range");
        if (nights > 10) throw new RuntimeException("Bookings cannot exceed 10 nights");
        double totalPrice = nights * room.getPrice();

        // ── 7. Build and save booking ──────────────────────────────────────
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckIn(req.getCheckIn());
        booking.setCheckOut(req.getCheckOut());
        booking.setGuests(req.getGuests() != null ? req.getGuests() : 1);
        booking.setTotalPrice(totalPrice);
        booking.setBookingRef("BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);

        // ── 8. Decrement available rooms count ─────────────────────────────
        room.setAvailableRooms(room.getAvailableRooms() - 1);
        roomRepository.save(room);

        return BookingResponse.fromEntity(saved);
    }

    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Only the booking owner can cancel
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: you can only cancel your own bookings");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // ── Cancel and restore available rooms ─────────────────────────────
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Room room = booking.getRoom();
        room.setAvailableRooms(room.getAvailableRooms() + 1);
        roomRepository.save(room);

        return BookingResponse.fromEntity(booking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
