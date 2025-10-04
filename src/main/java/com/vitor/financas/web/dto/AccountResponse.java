package com.vitor.financas.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        String type,
        BigDecimal initialBalance,
        BigDecimal balance,
        Instant createdAt
) {
}
