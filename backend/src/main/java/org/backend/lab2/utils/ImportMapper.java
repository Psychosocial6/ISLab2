package org.backend.lab2.utils;

import lombok.RequiredArgsConstructor;
import org.backend.lab2.persons.dto.PersonRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@RequiredArgsConstructor
@Component
public class ImportMapper {
    private final ObjectMapper objectMapper;

    public List<PersonRequest> parseRequest(MultipartFile file) {
        try {
            return objectMapper.readValue(file.getInputStream(), new TypeReference<List<PersonRequest>>() {
            });
        } catch (Exception e) {
            throw new IllegalArgumentException("Error while parsing json: " + e.getMessage());
        }
    }
}
