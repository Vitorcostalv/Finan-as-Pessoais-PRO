package com.vitor.financas.report;

import java.math.BigDecimal;

public record PeriodSummary(BigDecimal totalIn, BigDecimal totalOut, BigDecimal net) {
}
