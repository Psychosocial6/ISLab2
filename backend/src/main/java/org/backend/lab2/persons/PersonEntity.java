package org.backend.lab2.persons;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.backend.lab2.coordinates.CoordinatesEntity;
import org.backend.lab2.enums.Color;
import org.backend.lab2.enums.Country;
import org.backend.lab2.locations.LocationEntity;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;


@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "person")
public class PersonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "name", nullable = false, columnDefinition = "TEXT CHECK (trim(name) <> '')")
    private String name;
    @ManyToOne
    @JoinColumn(name = "coordinates_id", nullable = false)
    private CoordinatesEntity coordinates;
    @Column(name = "creation_date", nullable = false)
    private LocalDateTime creationDate;
    @Column(name = "eye_color", nullable = false)
    @Enumerated(EnumType.STRING)
    private Color eyeColor;
    @Column(name = "hair_color")
    @Enumerated(EnumType.STRING)
    private Color hairColor;
    @ManyToOne
    @JoinColumn(name = "location_id")
    private LocationEntity location;
    @Column(name = "height", nullable = false, columnDefinition = "DOUBLE PRECISION CHECK (height > 0)")
    private Double height;
    @Column(name = "birthday")
    private ZonedDateTime birthday;
    @Column(name = "weight", nullable = false, columnDefinition = "DOUBLE PRECISION CHECK (weight > 0)")
    private Double weight;
    @Column(name = "nationality", nullable = false)
    @Enumerated(EnumType.STRING)
    private Country nationality;

    public PersonEntity(
            String name,
            CoordinatesEntity coordinates,
            Color eyeColor,
            Color hairColor,
            LocationEntity location,
            Double height,
            ZonedDateTime birthday,
            Double weight,
            Country nationality
    ) {
        this.name = name;
        this.coordinates = coordinates;
        this.eyeColor = eyeColor;
        this.hairColor = hairColor;
        this.location = location;
        this.height = height;
        this.birthday = birthday;
        this.weight = weight;
        this.nationality = nationality;
    }

    @PrePersist
    private void onCreate() {
        creationDate = LocalDateTime.now();
    }
}
