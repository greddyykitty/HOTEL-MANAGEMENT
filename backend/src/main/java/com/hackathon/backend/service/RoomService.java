package com.hackathon.backend.service;

import com.hackathon.backend.model.Hotel;
import com.hackathon.backend.model.Room;
import com.hackathon.backend.payload.request.RoomRequest;
import com.hackathon.backend.payload.response.RoomResponse;
import com.hackathon.backend.repository.HotelRepository;
import com.hackathon.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public List<RoomResponse> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getAvailableRoomsByHotel(Long hotelId) {
        return roomRepository.findAvailableRoomsByHotel(hotelId)
                .stream()
                .map(RoomResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public RoomResponse createRoom(RoomRequest req) {
        Hotel hotel = hotelRepository.findById(req.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found: " + req.getHotelId()));
        Room room = mapToEntity(new Room(), req, hotel);
        return RoomResponse.fromEntity(roomRepository.save(room));
    }

    public RoomResponse updateRoom(Long id, RoomRequest req) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found: " + id));
        Hotel hotel = room.getHotel();
        // Allow changing hotel
        if (req.getHotelId() != null && !req.getHotelId().equals(hotel.getId())) {
            hotel = hotelRepository.findById(req.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found: " + req.getHotelId()));
        }
        return RoomResponse.fromEntity(roomRepository.save(mapToEntity(room, req, hotel)));
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new RuntimeException("Room not found: " + id);
        }
        roomRepository.deleteById(id);
    }

    private Room mapToEntity(Room room, RoomRequest req, Hotel hotel) {
        room.setHotel(hotel);
        room.setRoomType(req.getRoomType());
        room.setPrice(req.getPrice());
        room.setCapacity(req.getCapacity());
        room.setAvailableRooms(req.getAvailableRooms());
        room.setDescription(req.getDescription());
        room.setImageUrl(req.getImageUrl());
        return room;
    }
}
