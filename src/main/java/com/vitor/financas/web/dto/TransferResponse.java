package com.vitor.financas.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferResponse(
        UUID id,
        UUID fromAccountId,
        UUID toAccountId,
        BigDecimal amount,
        String description,
        Instant occurredAt,
        Instant createdAt
) {
}
