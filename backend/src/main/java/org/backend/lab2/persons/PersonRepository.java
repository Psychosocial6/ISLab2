package org.backend.lab2.persons;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<PersonEntity, Long> {
    List<PersonEntity> findByHeight(Double height);

    Page<PersonEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
