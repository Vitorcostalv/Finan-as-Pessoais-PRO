package com.vitor.financas.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        UUID categoryId,
        LocalDate month,
        BigDecimal amount,
        Instant createdAt
) {
}
