package com.vitor.financas.web.dto;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String kind,
        String color,
        Instant createdAt
) {
}
