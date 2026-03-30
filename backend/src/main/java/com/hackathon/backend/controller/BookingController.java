package com.hackathon.backend.controller;

import com.hackathon.backend.payload.request.BookingRequest;
import com.hackathon.backend.payload.response.BookingResponse;
import com.hackathon.backend.security.UserDetailsImpl;
import com.hackathon.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer booking endpoints (authentication required):
 * POST /api/bookings
 * GET  /api/bookings/my
 * DELETE /api/bookings/{id}   (cancel)
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /** POST /api/bookings — Create a booking */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BookingRequest req) {
        try {
            BookingResponse response = bookingService.createBooking(userDetails.getId(), req);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** GET /api/bookings/my — Get current user's booking history */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.getUserBookings(userDetails.getId()));
    }

    /** DELETE /api/bookings/{id} — Cancel a booking (restores availableRooms) */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            BookingResponse response = bookingService.cancelBooking(id, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
