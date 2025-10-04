package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record AccountRequest(
        @NotBlank String name,
        @NotNull @PositiveOrZero BigDecimal initialBalance,
        String type
) {
}
