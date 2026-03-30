package com.hackathon.backend.payload.response;

import com.hackathon.backend.model.Hotel;

public class HotelResponse {
    private Long id;
    private String name;
    private String location;
    private String description;
    private Double rating;
    private String imageUrl;
    private String amenities;

    public static HotelResponse fromEntity(Hotel h) {
        HotelResponse r = new HotelResponse();
        r.setId(h.getId());
        r.setName(h.getName());
        r.setLocation(h.getLocation());
        r.setDescription(h.getDescription());
        r.setRating(h.getRating());
        r.setImageUrl(h.getImageUrl());
        r.setAmenities(h.getAmenities());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
}
