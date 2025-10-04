package com.vitor.financas.web.controller;

import com.vitor.financas.service.RecurringRuleService;
import com.vitor.financas.web.dto.RecurringRuleRequest;
import com.vitor.financas.web.dto.RecurringRuleResponse;
import com.vitor.financas.web.mapper.RecurringRuleMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recurring-rules")
public class RecurringRuleController {

    private final RecurringRuleService recurringRuleService;
    private final RecurringRuleMapper recurringRuleMapper;

    public RecurringRuleController(RecurringRuleService recurringRuleService, RecurringRuleMapper recurringRuleMapper) {
        this.recurringRuleService = recurringRuleService;
        this.recurringRuleMapper = recurringRuleMapper;
    }

    @PostMapping
    public ResponseEntity<RecurringRuleResponse> create(@Valid @RequestBody RecurringRuleRequest request) {
        return ResponseEntity.ok(recurringRuleMapper.toResponse(recurringRuleService.create(
                request.accountId(),
                request.categoryId(),
                request.baseType(),
                request.baseAmount(),
                request.descriptionTemplate(),
                request.frequency(),
                request.nextRun())));
    }

    @GetMapping
    public ResponseEntity<List<RecurringRuleResponse>> listActive() {
        return ResponseEntity.ok(recurringRuleService.listActive().stream()
                .map(recurringRuleMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<RecurringRuleResponse> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(recurringRuleMapper.toResponse(recurringRuleService.deactivate(id)));
    }
}
