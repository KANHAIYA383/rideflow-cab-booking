
package com.cabbooking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "ride_id", nullable = false, unique = true)
    private Ride ride;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    private String paymentMethod;

    @Column(nullable = false)
    private String status = "PENDING";

    private String transactionId;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Payment() {}

    public Long getId() { return id; }
    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
