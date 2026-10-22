
package com.cabbooking.controller;

import com.cabbooking.entity.Ride;
import com.cabbooking.repository.RideRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = "http://localhost:5173")
public class RideHistoryController {

    private final RideRepository rideRepository;

    public RideHistoryController(RideRepository rideRepository) {
        this.rideRepository = rideRepository;
    }

    @GetMapping("/rider/{riderId}")
    public ResponseEntity<?> getRiderRideHistory(
            @PathVariable Long riderId) {

        if (riderId == null || riderId <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid rider ID."));
        }

        List<Ride> rides =
                rideRepository.findByRiderIdOrderByCreatedAtDesc(riderId);

        return ResponseEntity.ok(rides);
    }
}

