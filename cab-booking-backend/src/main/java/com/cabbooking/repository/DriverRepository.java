package com.cabbooking.repository;

import com.cabbooking.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    List<Driver> findByAvailableTrue();

    boolean existsByUserId(Long userId);

    boolean existsByLicenseNumber(String licenseNumber);
}
