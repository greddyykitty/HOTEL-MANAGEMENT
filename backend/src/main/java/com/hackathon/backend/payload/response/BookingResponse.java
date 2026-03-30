package com.hackathon.backend.payload.response;

import com.hackathon.backend.model.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {
    private Long id;
    private Long roomId;
    private String roomType;
    private Long hotelId;
    private String hotelName;
    private String hotelLocation;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String status;
    private Double totalPrice;
    private String bookingRef;
    private Integer guests;
    private String customerName;
    private String customerEmail;
    private LocalDateTime createdAt;

    public static BookingResponse fromEntity(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setRoomId(b.getRoom().getId());
        r.setRoomType(b.getRoom().getRoomType());
        r.setHotelId(b.getRoom().getHotel().getId());
        r.setHotelName(b.getRoom().getHotel().getName());
        r.setHotelLocation(b.getRoom().getHotel().getLocation());
        r.setCheckIn(b.getCheckIn());
        r.setCheckOut(b.getCheckOut());
        r.setStatus(b.getStatus().name());
        r.setTotalPrice(b.getTotalPrice());
        r.setBookingRef(b.getBookingRef());
        r.setGuests(b.getGuests());
        r.setCustomerName(b.getUser().getName());
        r.setCustomerEmail(b.getUser().getEmail());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getHotelLocation() { return hotelLocation; }
    public void setHotelLocation(String hotelLocation) { this.hotelLocation = hotelLocation; }

    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }

    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
