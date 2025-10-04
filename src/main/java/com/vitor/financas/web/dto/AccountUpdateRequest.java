package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotBlank;

public record AccountUpdateRequest(@NotBlank String name) {
}
