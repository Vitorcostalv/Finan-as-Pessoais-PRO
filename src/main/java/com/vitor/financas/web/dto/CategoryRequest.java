package com.vitor.financas.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank String name,
        @NotBlank String kind,
        @NotBlank String color
) {
}
