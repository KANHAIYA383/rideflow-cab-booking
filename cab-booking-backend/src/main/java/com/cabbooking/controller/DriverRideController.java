
package com.cabbooking.controller;

import com.cabbooking.entity.Driver;
import com.cabbooking.entity.Ride;
import com.cabbooking.repository.DriverRepository;
import com.cabbooking.repository.RideRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver/rides")
@CrossOrigin(origins = "http://localhost:5173")
public class DriverRideController {

    private final RideRepository rideRepository;
    private final DriverRepository driverRepository;

    public DriverRideController(
            RideRepository rideRepository,
            DriverRepository driverRepository) {
        this.rideRepository = rideRepository;
        this.driverRepository = driverRepository;
    }

    
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableRides(
            @RequestParam Long driverId) {

        Driver driver = driverRepository.findById(driverId)
            .orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found")
            );
        }

        if (!driver.isAvailable()) {
            return ResponseEntity.ok(List.of());
        }

        List<Ride> rides = rideRepository.findByStatus("REQUESTED");
        return ResponseEntity.ok(rides);
    }


    @GetMapping("/my-rides/{driverId}")
    public ResponseEntity<?> getMyRides(@PathVariable Long driverId) {
        if (!driverRepository.existsById(driverId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Driver not found"));
        }

        List<Ride> rides = rideRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
        return ResponseEntity.ok(rides);
    }


    @PostMapping("/{rideId}/accept")
    public ResponseEntity<?> acceptRide(
            @PathVariable Long rideId,
            @RequestBody DriverActionRequest request) {

        if (request.driverId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Driver ID is required")
            );
        }

        Driver driver = driverRepository.findById(request.driverId())
            .orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found")
            );
        }

        
        if (!driver.isAvailable()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", "You are offline. Go online to accept new rides.")
            );
        }


        Ride ride = rideRepository.findById(rideId).orElse(null);

        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Ride not found")
            );
        }

        if (!"REQUESTED".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "This ride is no longer available")
            );
        }

        ride.setDriver(driver);
        ride.setStatus("ACCEPTED");
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of(
            "message", "Ride accepted successfully",
            "rideId", ride.getId(),
            "driverId", driver.getId(),
            "status", ride.getStatus()
        ));
    }

    
    @PostMapping("/{rideId}/start")
    public ResponseEntity<?> startRide(
            @PathVariable Long rideId,
            @RequestBody DriverActionRequest request) {

        if (request.driverId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Driver ID is required")
            );
        }

        Driver driver = driverRepository.findById(request.driverId())
            .orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found")
            );
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);

        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Ride not found")
            );
        }

        if (!"ACCEPTED".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Only accepted rides can be started")
            );
        }

        if (ride.getDriver() == null ||
                !ride.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", "This ride is assigned to another driver")
            );
        }

        ride.setStatus("IN_PROGRESS");
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of(
            "message", "Ride started successfully",
            "rideId", ride.getId(),
            "status", ride.getStatus()
        ));
    }

    
    @PostMapping("/{rideId}/complete")
    public ResponseEntity<?> completeRide(
            @PathVariable Long rideId,
            @RequestBody DriverActionRequest request) {

        if (request.driverId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Driver ID is required")
            );
        }

        Driver driver = driverRepository.findById(request.driverId())
            .orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found")
            );
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);

        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Ride not found")
            );
        }

        if (!"IN_PROGRESS".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Only in-progress rides can be completed")
            );
        }

        if (ride.getDriver() == null ||
                !ride.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", "This ride is assigned to another driver")
            );
        }

        ride.setStatus("COMPLETED");
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of(
            "message", "Ride completed successfully",
            "rideId", ride.getId(),
            "status", ride.getStatus()
        ));
    }



    @PostMapping("/{rideId}/reject")
    public ResponseEntity<?> rejectRide(
            @PathVariable Long rideId,
            @RequestBody DriverActionRequest request) {

        if (request.driverId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Driver ID is required")
            );
        }

        boolean driverExists =
            driverRepository.existsById(request.driverId());

        if (!driverExists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found")
            );
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);

        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Ride not found")
            );
        }

        if (!"REQUESTED".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "This ride is no longer available")
            );
        }

        // This MVP records rejection as a ride-wide status.
        // A future per-driver rejection table is needed to let
        // other drivers continue seeing this ride.
        ride.setStatus("REJECTED");
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of(
            "message", "Ride rejected",
            "rideId", ride.getId(),
            "status", ride.getStatus()
        ));
    }
    
    @PostMapping("/{rideId}/location")
    public ResponseEntity<?> updateDriverLocation(
            @PathVariable Long rideId,
            @RequestBody DriverLocationRequest request) {

        if (request.driverId() == null
                || request.latitude() == null
                || request.longitude() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Driver ID, latitude and longitude are required.")
            );
        }

        if (!Double.isFinite(request.latitude())
                || !Double.isFinite(request.longitude())
                || request.latitude() < -90
                || request.latitude() > 90
                || request.longitude() < -180
                || request.longitude() > 180) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid latitude or longitude.")
            );
        }

        Driver driver = driverRepository.findById(request.driverId())
            .orElse(null);

        if (driver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Driver not found.")
            );
        }

        Ride ride = rideRepository.findById(rideId).orElse(null);

        if (ride == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Ride not found.")
            );
        }

        if (ride.getDriver() == null
                || !ride.getDriver().getId().equals(driver.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of("message", "This ride is assigned to another driver.")
            );
        }

        if (!"IN_PROGRESS".equals(ride.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("message", "Location can only be updated during an active ride.")
            );
        }

        ride.setDriverLatitude(request.latitude());
        ride.setDriverLongitude(request.longitude());
        ride.setDriverLocationUpdatedAt(java.time.LocalDateTime.now());
        rideRepository.save(ride);

        return ResponseEntity.ok(Map.of(
            "message", "Driver location updated successfully.",
            "rideId", ride.getId(),
            "updatedAt", ride.getDriverLocationUpdatedAt().toString()
        ));
    }

    public record DriverLocationRequest(
        Long driverId,
        Double latitude,
        Double longitude
    ) {}


    public record DriverActionRequest(Long driverId) {}
}
