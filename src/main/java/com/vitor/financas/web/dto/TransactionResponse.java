package com.vitor.financas.web.dto;

import com.vitor.financas.domain.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID accountId,
        UUID categoryId,
        TransactionType type,
        BigDecimal amount,
        String description,
        Instant occurredAt,
        Instant createdAt
) {
}
