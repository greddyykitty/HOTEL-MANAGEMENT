package com.hackathon.backend.controller;

import com.hackathon.backend.model.Role;
import com.hackathon.backend.model.User;
import com.hackathon.backend.payload.request.LoginRequest;
import com.hackathon.backend.payload.request.RegisterRequest;
import com.hackathon.backend.payload.response.AuthResponse;
import com.hackathon.backend.payload.response.MessageResponse;
import com.hackathon.backend.repository.UserRepository;
import com.hackathon.backend.security.JwtUtils;
import com.hackathon.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * POST /api/auth/register
     * Registers a new CUSTOMER user.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already registered!"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setUsername(req.getEmail());  // username = email for auth chain
        user.setPassword(encoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(Role.CUSTOMER);       // All self-registrations are CUSTOMER

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    /**
     * POST /api/auth/login
     * Authenticates user and returns JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest req) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority())
                .orElse("ROLE_CUSTOMER");

        // Fetch name from DB
        User user = userRepository.findByEmail(req.getEmail())
                .orElse(null);
        String name = user != null ? user.getName() : userDetails.getUsername();

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getId(), name,
                userDetails.getEmail(), role));
    }
}
