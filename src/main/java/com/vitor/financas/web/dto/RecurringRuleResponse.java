package com.vitor.financas.web.dto;

import com.vitor.financas.domain.enums.Frequency;
import com.vitor.financas.domain.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringRuleResponse(
        UUID id,
        UUID accountId,
        UUID categoryId,
        TransactionType baseType,
        BigDecimal baseAmount,
        String descriptionTemplate,
        Frequency frequency,
        LocalDate nextRun,
        boolean active,
        Instant createdAt
) {
}
