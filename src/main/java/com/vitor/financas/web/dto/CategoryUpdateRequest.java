package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryUpdateRequest(
        @NotBlank String name,
        @NotBlank String color
) {
}
