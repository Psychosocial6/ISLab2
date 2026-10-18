package org.backend.lab2.imports.dto;

import org.backend.lab2.imports.ImportStatus;

public record ImportLog(
        Long id,
        ImportStatus status,
        Long userId,
        Long addedCount
) {
}
