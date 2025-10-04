package com.vitor.financas.report;

import java.math.BigDecimal;
import java.util.UUID;

public record CategorySummary(UUID categoryId, String categoryName, String kind, BigDecimal total) {
}
