package com.vitor.financas.web.dto;

import com.vitor.financas.domain.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionRequest(
        @NotNull UUID accountId,
        UUID categoryId,
        @NotNull TransactionType type,
        @NotNull @Positive BigDecimal amount,
        String description,
        @NotNull Instant occurredAt
) {
}
