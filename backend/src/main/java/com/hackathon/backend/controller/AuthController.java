package com.hackathon.backend.controller;

import com.hackathon.backend.model.Role;
import com.hackathon.backend.model.User;
import com.hackathon.backend.payload.request.LoginRequest;
import com.hackathon.backend.payload.request.SignupRequest;
import com.hackathon.backend.payload.response.JwtResponse;
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

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // Determine if identifier is email or username
        String usernameOrEmail = loginRequest.getIdentifier();
        
        // Let UserDetailsServiceImpl handle resolving username or email
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 userDetails.getAuthorities().stream().findFirst().get().getAuthority()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        if (signUpRequest.getDob() != null) {
            java.time.Period period = java.time.Period.between(signUpRequest.getDob(), java.time.LocalDate.now());
            if (period.getYears() <= 10) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: User must be strictly older than 10 years!"));
            }
        }

        // Create new user's account
        User user = new User();
        user.setFullName(signUpRequest.getFullName());
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setPhone(signUpRequest.getPhone());
        user.setDob(signUpRequest.getDob());
        user.setGender(signUpRequest.getGender());
        user.setAddress(signUpRequest.getAddress());
        user.setRole(Role.USER); // Default Role

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
