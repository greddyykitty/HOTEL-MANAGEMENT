package com.hackathon.backend.controller;

import com.hackathon.backend.model.Role;
import com.hackathon.backend.model.User;
import com.hackathon.backend.payload.request.HotelRequest;
import com.hackathon.backend.payload.request.RoomRequest;
import com.hackathon.backend.payload.response.BookingResponse;
import com.hackathon.backend.payload.response.HotelResponse;
import com.hackathon.backend.payload.response.MessageResponse;
import com.hackathon.backend.payload.response.RoomResponse;
import com.hackathon.backend.repository.HotelRepository;
import com.hackathon.backend.repository.UserRepository;
import com.hackathon.backend.service.BookingService;
import com.hackathon.backend.service.HotelService;
import com.hackathon.backend.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin-only endpoints (requires ROLE_ADMIN):
 * POST   /api/admin/hotels
 * PUT    /api/admin/hotels/{id}
 * DELETE /api/admin/hotels/{id}
 * POST   /api/admin/rooms
 * PUT    /api/admin/rooms/{id}
 * DELETE /api/admin/rooms/{id}
 * GET    /api/admin/bookings
 * GET    /api/admin/stats
 * GET    /api/admin/users
 * PATCH  /api/admin/users/{id}/role
 * DELETE /api/admin/users/{id}
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private HotelService hotelService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    // ─── Hotel Management ──────────────────────────────────────────────────────

    @PostMapping("/hotels")
    public ResponseEntity<HotelResponse> createHotel(@Valid @RequestBody HotelRequest req) {
        return ResponseEntity.ok(hotelService.createHotel(req));
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<HotelResponse> updateHotel(@PathVariable Long id,
                                                      @Valid @RequestBody HotelRequest req) {
        return ResponseEntity.ok(hotelService.updateHotel(id, req));
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<MessageResponse> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(new MessageResponse("Hotel deleted successfully"));
    }

    // ─── Room Management ───────────────────────────────────────────────────────

    @PostMapping("/rooms")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest req) {
        return ResponseEntity.ok(roomService.createRoom(req));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id,
                                                    @Valid @RequestBody RoomRequest req) {
        return ResponseEntity.ok(roomService.updateRoom(id, req));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<MessageResponse> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(new MessageResponse("Room deleted successfully"));
    }

    // ─── Booking Management ────────────────────────────────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // ─── Dashboard Stats ───────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<BookingResponse> allBookings = bookingService.getAllBookings();
        double revenue = allBookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalHotels", hotelRepository.count());
        stats.put("totalBookings", allBookings.size());
        stats.put("confirmedBookings", allBookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count());
        stats.put("cancelledBookings", allBookings.stream().filter(b -> "CANCELLED".equals(b.getStatus())).count());
        stats.put("totalRevenue", revenue);
        return ResponseEntity.ok(stats);
    }

    // ─── User Management ───────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
                                             @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        try {
            user.setRole(Role.valueOf(body.get("role")));
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Role updated to " + body.get("role")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid role. Valid values: CUSTOMER, ADMIN"));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
