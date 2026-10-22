package com.cabbooking.controller;

import com.cabbooking.entity.Driver;
import com.cabbooking.entity.User;
import com.cabbooking.repository.DriverRepository;
import com.cabbooking.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    public DriverController(
            DriverRepository driverRepository,
            UserRepository userRepository) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;  
    }
    private Long getAuthenticatedUserId() {
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null
            || !(authentication.getPrincipal() instanceof Long userId)) {
        return null;
    }

    return userId;
}

    @PostMapping("/register")
    public ResponseEntity<?> registerDriver(
        
            @RequestBody DriverRegistrationRequest request) {
                
Long authenticatedUserId = getAuthenticatedUserId();

if (authenticatedUserId == null) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        Map.of("error", "Authentication required.")
    );
}

if (!authenticatedUserId.equals(request.userId())) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        Map.of("error", "You can only register your own account as a driver.")
    );
}


        if (request.userId() == null
                || request.licenseNumber() == null
                || request.licenseNumber().isBlank()
                || request.vehicleModel() == null
                || request.vehicleModel().isBlank()
                || request.vehicleNumber() == null
                || request.vehicleNumber().isBlank()
                || request.vehicleType() == null
                || request.vehicleType().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "All driver and vehicle fields are required.")
            );
        }

        User user = userRepository.findById(request.userId()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "User not found. Register a user account first.")
            );
        }

        if ("DRIVER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("error", "This user is already registered as a driver.")
            );
        }

        if (driverRepository.existsByUserId(user.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("error", "A driver profile already exists for this user.")
            );
        }

        String vehicleType = request.vehicleType().trim();
        if (!vehicleType.equalsIgnoreCase("Mini")
                && !vehicleType.equalsIgnoreCase("Sedan")
                && !vehicleType.equalsIgnoreCase("SUV")) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Vehicle type must be Mini, Sedan or SUV.")
            );
        }

        Driver driver = new Driver();
        driver.setUser(user);
        driver.setLicenseNumber(request.licenseNumber().trim());
        driver.setVehicleModel(request.vehicleModel().trim());
        driver.setVehicleNumber(request.vehicleNumber().trim());
        driver.setVehicleType(
            vehicleType.equalsIgnoreCase("SUV") ? "SUV"
                : vehicleType.equalsIgnoreCase("Sedan") ? "Sedan" : "Mini"
        );
        driver.setAvailable(false);

        try {
            Driver savedDriver = driverRepository.save(driver);
            user.setRole("DRIVER");
            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "driverId", savedDriver.getId(),
                    "userId", user.getId(),
                    "name", user.getFullName(),
                    "licenseNumber", savedDriver.getLicenseNumber(),
                    "vehicleModel", savedDriver.getVehicleModel(),
                    "vehicleNumber", savedDriver.getVehicleNumber(),
                    "vehicleType", savedDriver.getVehicleType(),
                    "available", savedDriver.isAvailable(),
                    "message", "Driver registered successfully."
                )
            );
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("error", "This licence number may already be registered.")
            );
        }
    }
    
    @PutMapping("/{driverId}/availability")
    public ResponseEntity<?> updateAvailability(
            @PathVariable Long driverId,
            @RequestBody AvailabilityRequest request) {
                
Long authenticatedUserId = getAuthenticatedUserId();

if (authenticatedUserId == null) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        Map.of("error", "Authentication required.")
    );
}


        if (request.available() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Availability must be true or false.")
            );
        }

        Driver driver = driverRepository.findById(driverId).orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "Driver not found.")
            );
        }
        
if (driver.getUser() == null
        || !driver.getUser().getId().equals(authenticatedUserId)) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        Map.of("error", "You can only change your own availability.")
    );
}


        driver.setAvailable(request.available());
        Driver savedDriver = driverRepository.save(driver);

        return ResponseEntity.ok(
            Map.of(
                "driverId", savedDriver.getId(),
                "available", savedDriver.isAvailable(),
                "message", savedDriver.isAvailable()
                    ? "You are now online."
                    : "You are now offline."
            )
        );
    }
    
    @GetMapping("/{driverId}/availability")
    public ResponseEntity<?> getAvailability(
            @PathVariable Long driverId) {
                
Long authenticatedUserId = getAuthenticatedUserId();

if (authenticatedUserId == null) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        Map.of("error", "Authentication required.")
    );
}


        Driver driver = driverRepository.findById(driverId).orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "Driver not found.")
            );
        }
        
if (driver.getUser() == null
        || !driver.getUser().getId().equals(authenticatedUserId)) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        Map.of("error", "You can only view your own availability.")
    );
}


        return ResponseEntity.ok(
            Map.of(
                "driverId", driver.getId(),
                "available", driver.isAvailable()
            )
        );
    }


    public record AvailabilityRequest(Boolean available) {}


    public record DriverRegistrationRequest(
        Long userId,
        String licenseNumber,
        String vehicleModel,
        String vehicleNumber,
        String vehicleType
    ) {}
}
