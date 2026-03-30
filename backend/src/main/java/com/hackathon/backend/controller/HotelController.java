package com.hackathon.backend.controller;

import com.hackathon.backend.payload.response.HotelResponse;
import com.hackathon.backend.payload.response.RoomResponse;
import com.hackathon.backend.service.HotelService;
import com.hackathon.backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public hotel endpoints (no authentication required):
 * GET /api/hotels
 * GET /api/hotels/{id}
 * GET /api/hotels/{id}/rooms
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @Autowired
    private RoomService roomService;

    /** GET /api/hotels?location=&minRating= — Search/list hotels */
    @GetMapping
    public ResponseEntity<List<HotelResponse>> getHotels(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String amenity) {
        return ResponseEntity.ok(hotelService.getHotels(location, minRating, minPrice, maxPrice, amenity));
    }

    /** GET /api/hotels/{id} — Hotel details */
    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotel(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    /** GET /api/hotels/{id}/rooms — Rooms for a hotel (shows available count) */
    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomResponse>> getHotelRooms(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        if (availableOnly) {
            return ResponseEntity.ok(roomService.getAvailableRoomsByHotel(id));
        }
        return ResponseEntity.ok(roomService.getRoomsByHotel(id));
    }
}
