
package com.cabbooking.controller;

import com.cabbooking.JwtService;
import com.cabbooking.entity.User;
import com.cabbooking.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.fullName() == null
                || request.email() == null
                || request.password() == null
                || request.fullName().isBlank()
                || request.email().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Name, email and password are required.")
            );
        }

        String name = request.fullName().trim();
        String email = request.email().trim().toLowerCase();

        if (name.length() > 100 || email.length() > 150) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Name or email is too long.")
            );
        }

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Enter a valid email address.")
            );
        }

        if (request.password().length() < 8
                || request.password().length() > 72) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Password must be 8–72 characters long.")
            );
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("error", "An account with this email already exists.")
            );
        }

        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("RIDER");

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "id", saved.getId(),
                "fullName", saved.getFullName(),
                "email", saved.getEmail(),
                "role", saved.getRole(),
                "message", "Registration successful."
            )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (request.email() == null || request.password() == null
                || request.email().isBlank()
                || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Email and password are required.")
            );
        }

        String email = request.email().trim().toLowerCase();

        var optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()
                || !passwordEncoder.matches(
                    request.password(),
                    optionalUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("error", "Invalid email or password.")
            );
        }

        User user = optionalUser.get();

        String token = jwtService.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRole()
        );

        return ResponseEntity.ok(
            Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", token,
                "message", "Login successful."
            )
        );
    }

    public record RegisterRequest(
        String fullName,
        String email,
        String password
    ) {}

    public record LoginRequest(
        String email,
        String password
    ) {}
}