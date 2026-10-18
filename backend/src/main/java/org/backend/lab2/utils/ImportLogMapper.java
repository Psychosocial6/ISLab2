package org.backend.lab2.utils;

import org.backend.lab2.imports.ImportLogEntity;
import org.backend.lab2.imports.dto.ImportLog;
import org.springframework.stereotype.Component;

@Component
public class ImportLogMapper {
    public ImportLog fromEntity(ImportLogEntity importLogEntity) {
        return new ImportLog(
                importLogEntity.getId(),
                importLogEntity.getStatus(),
                importLogEntity.getUserId(),
                importLogEntity.getAddedCount()
        );
    }
}
