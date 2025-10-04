package com.vitor.financas.web.dto;

import com.vitor.financas.domain.enums.Frequency;
import com.vitor.financas.domain.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringRuleRequest(
        @NotNull UUID accountId,
        UUID categoryId,
        @NotNull TransactionType baseType,
        @NotNull @Positive BigDecimal baseAmount,
        String descriptionTemplate,
        @NotNull Frequency frequency,
        @NotNull LocalDate nextRun
) {
}
