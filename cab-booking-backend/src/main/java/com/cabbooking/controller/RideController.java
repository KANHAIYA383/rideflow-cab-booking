
package com.cabbooking.controller;

import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;
import com.cabbooking.repository.RideRepository;
import com.cabbooking.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;

    public RideController(
            RideRepository rideRepository,
            UserRepository userRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> bookRide(@RequestBody RideRequest request) {

       if (request.pickupLocation() == null
        || request.dropoffLocation() == null
        || request.pickupLocation().isBlank()
        || request.dropoffLocation().isBlank()) {
    return ResponseEntity.badRequest().body(
        Map.of("error", "Pickup and destination are required.")
    );
}

        if (request.pickupLocation().length() > 255
                || request.dropoffLocation().length() > 255) {
            return ResponseEntity.badRequest().body(
                Map.of("error",
                    "Locations must be 255 characters or fewer.")
            );
        }

        if (request.pickupLocation().trim()
                .equalsIgnoreCase(request.dropoffLocation().trim())) {
            return ResponseEntity.badRequest().body(
                Map.of("error",
                    "Pickup and destination must be different.")
            );
        }

        Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

if (authentication == null
        || !(authentication.getPrincipal() instanceof Long riderId)
        || !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RIDER"))) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        Map.of("error", "Only authenticated riders can book rides.")
    );
}

User rider = userRepository.findById(riderId).orElse(null);

if (rider == null) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
        Map.of("error", "Rider account not found.")
    );
}

        // Temporary defaults until the frontend sends these values.
        String vehicleType = request.vehicleType() == null
                ? "Mini"
                : request.vehicleType().trim();

        BigDecimal distanceKm = request.distanceKm() == null
                ? BigDecimal.TEN
                : request.distanceKm();

        if (distanceKm.compareTo(BigDecimal.ZERO) <= 0
                || distanceKm.compareTo(new BigDecimal("1000")) > 0) {
            return ResponseEntity.badRequest().body(
                Map.of("error",
                    "Distance must be greater than 0 and at most 1000 km.")
            );
        }

        BigDecimal baseFare;
        BigDecimal ratePerKm;

        switch (vehicleType.toLowerCase()) {
            case "mini" -> {
                vehicleType = "Mini";
                baseFare = new BigDecimal("40");
                ratePerKm = new BigDecimal("12");
            }
            case "sedan" -> {
                vehicleType = "Sedan";
                baseFare = new BigDecimal("70");
                ratePerKm = new BigDecimal("16");
            }
            case "suv" -> {
                vehicleType = "SUV";
                baseFare = new BigDecimal("100");
                ratePerKm = new BigDecimal("22");
            }
            default -> {
                return ResponseEntity.badRequest().body(
                    Map.of("error",
                        "Vehicle type must be Mini, Sedan or SUV.")
                );
            }
        }

        BigDecimal fare = baseFare
                .add(ratePerKm.multiply(distanceKm))
                .setScale(2, RoundingMode.HALF_UP);

        Ride ride = new Ride();
        ride.setRider(rider);
        ride.setPickupLocation(request.pickupLocation().trim());
        ride.setDropoffLocation(request.dropoffLocation().trim());
        ride.setFare(fare);
        ride.setVehicleType(vehicleType);
        ride.setDistanceKm(distanceKm);
        ride.setStatus("REQUESTED");

        Ride savedRide = rideRepository.save(ride);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
                "id", savedRide.getId(),
                "pickupLocation", savedRide.getPickupLocation(),
                "dropoffLocation", savedRide.getDropoffLocation(),
                "vehicleType", vehicleType,
                "distanceKm", distanceKm,
                "fare", savedRide.getFare(),
                "status", savedRide.getStatus(),
                "message", "Ride request created successfully."
            )
        );
    }

    public record RideRequest(
        Long riderId,
        String pickupLocation,
        String dropoffLocation,
        String vehicleType,
        BigDecimal distanceKm
    ) {}

        @GetMapping("/{rideId}/tracking")
        public ResponseEntity<?> getRideTracking(
                @PathVariable Long rideId) {
                    Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

if (authentication == null
        || !(authentication.getPrincipal() instanceof Long userId)) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        Map.of("error", "Authentication required.")
    );
}

            Ride ride = rideRepository.findById(rideId)
                    .orElse(null);

            if (ride == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ride not found."));
            }
            boolean isRider = ride.getRider() != null
        && ride.getRider().getId().equals(userId);

boolean isAssignedDriver = ride.getDriver() != null
        && ride.getDriver().getUser() != null
        && ride.getDriver().getUser().getId().equals(userId);

if (!isRider && !isAssignedDriver) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        Map.of("error", "You are not authorized to view this ride.")
    );
}

            if (ride.getDriver() == null) {
                return ResponseEntity.ok(Map.of(
                        "rideId", ride.getId(),
                        "status", ride.getStatus(),
                        "message", "No driver has been assigned yet."
                ));
            }

            if (ride.getDriverLatitude() == null
                    || ride.getDriverLongitude() == null) {
                return ResponseEntity.ok(Map.of(
                        "rideId", ride.getId(),
                        "status", ride.getStatus(),
                        "message", "Driver location is not available yet."
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "rideId", ride.getId(),
                    "status", ride.getStatus(),
                    "driverLatitude", ride.getDriverLatitude(),
                    "driverLongitude", ride.getDriverLongitude(),
                    "locationUpdatedAt", ride.getDriverLocationUpdatedAt() == null
                            ? ""
                            : ride.getDriverLocationUpdatedAt().toString()
            ));
        }
}
