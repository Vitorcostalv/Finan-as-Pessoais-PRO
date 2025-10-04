package com.vitor.financas.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyCashFlowItem(LocalDate date, BigDecimal net) {
}
