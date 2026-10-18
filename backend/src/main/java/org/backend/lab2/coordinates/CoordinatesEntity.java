package org.backend.lab2.coordinates;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "coordinates")
@Entity
public class CoordinatesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "x", nullable = false)
    private Float x;
    @Column(name = "y", nullable = false)
    private Float y;

    public CoordinatesEntity(Float x, Float y) {
        this.x = x;
        this.y = y;
    }
}
