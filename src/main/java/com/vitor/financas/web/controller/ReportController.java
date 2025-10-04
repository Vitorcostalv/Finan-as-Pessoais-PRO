package com.vitor.financas.web.controller;

import com.vitor.financas.report.ReportService;
import com.vitor.financas.web.dto.CategorySummaryResponse;
import com.vitor.financas.web.dto.DailyCashFlowResponse;
import com.vitor.financas.web.dto.PeriodSummaryResponse;
import com.vitor.financas.web.mapper.ReportMapper;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportMapper reportMapper;

    public ReportController(ReportService reportService, ReportMapper reportMapper) {
        this.reportService = reportService;
        this.reportMapper = reportMapper;
    }

    @GetMapping("/summary")
    public ResponseEntity<PeriodSummaryResponse> summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(reportMapper.toResponse(reportService.summarize(start, end)));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategorySummaryResponse>> byCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(reportService.summarizeByCategory(start, end).stream()
                .map(reportMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/cashflow")
    public ResponseEntity<List<DailyCashFlowResponse>> cashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(reportService.dailyCashFlow(start, end).stream()
                .map(reportMapper::toResponse)
                .collect(Collectors.toList()));
    }
}
