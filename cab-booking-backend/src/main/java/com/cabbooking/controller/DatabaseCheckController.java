
package com.cabbooking.controller;

import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DatabaseCheckController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCheckController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/db-check")
    public Map<String, Object> checkDatabase() {
        return jdbcTemplate.queryForMap(
            "SELECT current_database() AS database_name, current_user AS database_user"
        );
    }
}

