package com.hackathon.backend.service;

import com.hackathon.backend.model.Hotel;
import com.hackathon.backend.payload.request.HotelRequest;
import com.hackathon.backend.payload.response.HotelResponse;
import com.hackathon.backend.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    public List<HotelResponse> getHotels(String location, Double minRating, Double minPrice, Double maxPrice, String amenity) {
        return hotelRepository.searchHotels(location, minRating, minPrice, maxPrice, amenity)
                .stream()
                .map(HotelResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return HotelResponse.fromEntity(hotel);
    }

    public HotelResponse createHotel(HotelRequest req) {
        Hotel hotel = mapToEntity(new Hotel(), req);
        return HotelResponse.fromEntity(hotelRepository.save(hotel));
    }

    public HotelResponse updateHotel(Long id, HotelRequest req) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return HotelResponse.fromEntity(hotelRepository.save(mapToEntity(hotel, req)));
    }

    public void deleteHotel(Long id) {
        if (!hotelRepository.existsById(id)) {
            throw new RuntimeException("Hotel not found with id: " + id);
        }
        hotelRepository.deleteById(id);
    }

    private Hotel mapToEntity(Hotel hotel, HotelRequest req) {
        hotel.setName(req.getName());
        hotel.setLocation(req.getLocation());
        hotel.setDescription(req.getDescription());
        hotel.setRating(req.getRating());
        hotel.setImageUrl(req.getImageUrl());
        hotel.setAmenities(req.getAmenities());
        return hotel;
    }
}
