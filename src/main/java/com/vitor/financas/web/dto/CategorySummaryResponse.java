package com.vitor.financas.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CategorySummaryResponse(UUID categoryId, String categoryName, String kind, BigDecimal total) {
}
