package com.vitor.financas.web.mapper;

import com.vitor.financas.report.CategorySummary;
import com.vitor.financas.report.DailyCashFlowItem;
import com.vitor.financas.report.PeriodSummary;
import com.vitor.financas.web.dto.CategorySummaryResponse;
import com.vitor.financas.web.dto.DailyCashFlowResponse;
import com.vitor.financas.web.dto.PeriodSummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public PeriodSummaryResponse toResponse(PeriodSummary summary) {
        if (summary == null) {
            return null;
        }
        return new PeriodSummaryResponse(summary.totalIn(), summary.totalOut(), summary.net());
    }

    public CategorySummaryResponse toResponse(CategorySummary summary) {
        if (summary == null) {
            return null;
        }
        return new CategorySummaryResponse(summary.categoryId(), summary.categoryName(), summary.kind(), summary.total());
    }

    public DailyCashFlowResponse toResponse(DailyCashFlowItem item) {
        if (item == null) {
            return null;
        }
        return new DailyCashFlowResponse(item.date(), item.net());
    }
}
