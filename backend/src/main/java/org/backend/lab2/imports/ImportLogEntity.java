package org.backend.lab2.imports;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Setter
@Getter
@Entity
@Table(name = "import_logs")
public class ImportLogEntity {
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    ImportStatus status;
    @Column(name = "user_id", nullable = false)
    Long userId;
    @Column(name = "added_count")
    Long addedCount;
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    public ImportLogEntity(ImportStatus status, Long userId, Long addedCount) {
        this.status = status;
        this.userId = userId;
        this.addedCount = addedCount;
    }
}
