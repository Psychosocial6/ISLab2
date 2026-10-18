package org.backend.lab2.imports;

import lombok.RequiredArgsConstructor;
import org.backend.lab2.imports.dto.ImportLog;
import org.backend.lab2.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api/import")
@RestController
public class ImportController {
    private final ImportService importService;

    @GetMapping("/history")
    public ResponseEntity<List<ImportLog>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(importService.getImportHistory(user));
    }
}
