package org.backend.lab2.imports;

import lombok.RequiredArgsConstructor;
import org.backend.lab2.imports.dto.ImportLog;
import org.backend.lab2.security.Role;
import org.backend.lab2.user.User;
import org.backend.lab2.utils.ImportLogMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ImportService {
    private final ImportRepository importRepository;
    private final ImportLogMapper importLogMapper;

    public List<ImportLog> getImportHistory(User user) {
        if (user.getRole() == Role.ROLE_USER) {
            return importRepository.findByUserId(user.getId())
                    .stream()
                    .map(importLogMapper::fromEntity)
                    .toList();
        }
        return importRepository.findAll()
                .stream()
                .map(importLogMapper::fromEntity)
                .toList();

    }

    public ImportLog logImport(ImportStatus status, Long userId, Long addedCount) {
        ImportLogEntity importLogEntity = new ImportLogEntity(status, userId, addedCount);
        return importLogMapper.fromEntity(importRepository.save(importLogEntity));
    }
}
