package com.vitor.financas.web.mapper;

import com.vitor.financas.report.CategorySummary;
import com.vitor.financas.report.DailyCashFlowItem;
import com.vitor.financas.report.PeriodSummary;
import com.vitor.financas.web.dto.CategorySummaryResponse;
import com.vitor.financas.web.dto.DailyCashFlowResponse;
import com.vitor.financas.web.dto.PeriodSummaryResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    PeriodSummaryResponse toResponse(PeriodSummary summary);
    CategorySummaryResponse toResponse(CategorySummary summary);
    DailyCashFlowResponse toResponse(DailyCashFlowItem item);
}
