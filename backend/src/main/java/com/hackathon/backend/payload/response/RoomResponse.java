package com.hackathon.backend.payload.response;

import com.hackathon.backend.model.Room;

public class RoomResponse {
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String roomType;
    private Double price;
    private Integer capacity;
    private Integer availableRooms;
    private String description;
    private String imageUrl;

    public static RoomResponse fromEntity(Room r) {
        RoomResponse res = new RoomResponse();
        res.setId(r.getId());
        res.setHotelId(r.getHotel().getId());
        res.setHotelName(r.getHotel().getName());
        res.setRoomType(r.getRoomType());
        res.setPrice(r.getPrice());
        res.setCapacity(r.getCapacity());
        res.setAvailableRooms(r.getAvailableRooms());
        res.setDescription(r.getDescription());
        res.setImageUrl(r.getImageUrl());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(Integer availableRooms) { this.availableRooms = availableRooms; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
