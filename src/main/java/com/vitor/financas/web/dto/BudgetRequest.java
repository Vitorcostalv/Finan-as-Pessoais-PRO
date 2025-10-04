package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetRequest(
        @NotNull UUID categoryId,
        @NotNull LocalDate month,
        @NotNull @Positive BigDecimal amount
) {
}
