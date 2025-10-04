package com.vitor.financas.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyCashFlowResponse(LocalDate date, BigDecimal net) {
}
