package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetUpdateRequest(@NotNull @Positive BigDecimal amount) {
}
