package com.vitor.financas.web.dto;

import java.math.BigDecimal;

public record PeriodSummaryResponse(BigDecimal totalIn, BigDecimal totalOut, BigDecimal net) {
}
