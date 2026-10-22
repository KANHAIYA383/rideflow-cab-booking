
package com.cabbooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(nullable = false)
    private String pickupLocation;

    @Column(nullable = false)
    private String dropoffLocation;

    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
    private Double driverLatitude;
    private Double driverLongitude;
    private LocalDateTime driverLocationUpdatedAt;


    @Column(precision = 10, scale = 2)
    private BigDecimal fare;

    @Column(length = 20)
    private String vehicleType;

    @Column(precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(nullable = false)
    private String status = "REQUESTED";

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime completedAt;

    public Ride() {}

    public Long getId() { return id; }
    public User getRider() { return rider; }
    public void setRider(User rider) { this.rider = rider; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }
    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }
    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }
    public Double getDropoffLatitude() { return dropoffLatitude; }
    public void setDropoffLatitude(Double dropoffLatitude) { this.dropoffLatitude = dropoffLatitude; }
    public Double getDropoffLongitude() { return dropoffLongitude; }
    
    public Double getDriverLatitude() { return driverLatitude; }
    public void setDriverLatitude(Double driverLatitude) {
        this.driverLatitude = driverLatitude;
    }

    public Double getDriverLongitude() { return driverLongitude; }
    public void setDriverLongitude(Double driverLongitude) {
        this.driverLongitude = driverLongitude;
    }

    public LocalDateTime getDriverLocationUpdatedAt() {
        return driverLocationUpdatedAt;
    }

    public void setDriverLocationUpdatedAt(LocalDateTime driverLocationUpdatedAt) {
        this.driverLocationUpdatedAt = driverLocationUpdatedAt;
    }

    public void setDropoffLongitude(Double dropoffLongitude) { this.dropoffLongitude = dropoffLongitude; }
    public BigDecimal getFare() { return fare; }
    public void setFare(BigDecimal fare) { this.fare = fare; }
    public String getVehicleType() {
    return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public BigDecimal getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(BigDecimal distanceKm) {
        this.distanceKm = distanceKm;
    }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
