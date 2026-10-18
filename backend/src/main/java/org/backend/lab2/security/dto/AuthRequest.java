package org.backend.lab2.security.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @NotBlank(message = "username required")
        String username,
        @NotBlank(message = "password required")
        String password) {
}
