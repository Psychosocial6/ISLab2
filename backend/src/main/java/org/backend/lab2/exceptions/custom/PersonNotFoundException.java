package org.backend.lab2.exceptions.custom;

public class PersonNotFoundException extends NotFoundException {
    public PersonNotFoundException(Long id) {
        super(String.format("Person id=%s not found", id));
    }
}
