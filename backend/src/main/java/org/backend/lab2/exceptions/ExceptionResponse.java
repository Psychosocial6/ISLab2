package org.backend.lab2.exceptions;

import java.time.LocalDateTime;

public record ExceptionResponse(
        int status,
        String message,
        LocalDateTime time
) {
}
