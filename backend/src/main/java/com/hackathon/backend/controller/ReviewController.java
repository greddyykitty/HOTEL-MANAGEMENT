package com.hackathon.backend.controller;

import com.hackathon.backend.model.Hotel;
import com.hackathon.backend.model.Review;
import com.hackathon.backend.model.User;
import com.hackathon.backend.payload.request.ReviewRequest;
import com.hackathon.backend.payload.response.MessageResponse;
import com.hackathon.backend.payload.response.ReviewResponse;
import com.hackathon.backend.repository.HotelRepository;
import com.hackathon.backend.repository.ReviewRepository;
import com.hackathon.backend.repository.UserRepository;
import com.hackathon.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    ReviewRepository reviewRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    HotelRepository hotelRepository;

    /**
     * POST /api/reviews
     * Submits a new review for a hotel.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> submitReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        Hotel hotel = hotelRepository.findById(reviewRequest.getHotelId()).orElse(null);

        if (user == null || hotel == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User or Hotel not found!"));
        }

        Review review = new Review();
        review.setUser(user);
        review.setHotel(hotel);
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());

        reviewRepository.save(review);

        // Update hotel average rating
        updateHotelAverageRating(hotel);

        return ResponseEntity.ok(new MessageResponse("Review submitted successfully!"));
    }

    /**
     * GET /api/reviews/hotel/{hotelId}
     * Fetches all reviews for a hotel.
     */
    @GetMapping("/hotel/{hotelId}")
    public List<ReviewResponse> getHotelReviews(@PathVariable Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId).stream()
                .map(r -> new ReviewResponse(
                        r.getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    private void updateHotelAverageRating(Hotel hotel) {
        List<Review> reviews = reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotel.getId());
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        hotel.setRating(Math.round(averageRating * 10.0) / 10.0); // round to 1 decimal place
        hotelRepository.save(hotel);
    }
}
