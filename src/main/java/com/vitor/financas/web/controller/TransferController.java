package com.vitor.financas.web.controller;

import com.vitor.financas.service.TransferService;
import com.vitor.financas.web.dto.TransferRequest;
import com.vitor.financas.web.dto.TransferResponse;
import com.vitor.financas.web.mapper.TransferMapper;
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
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;
    private final TransferMapper transferMapper;

    public TransferController(TransferService transferService, TransferMapper transferMapper) {
        this.transferService = transferService;
        this.transferMapper = transferMapper;
    }

    @PostMapping
    public ResponseEntity<TransferResponse> create(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(transferMapper.toResponse(transferService.create(
                request.fromAccountId(),
                request.toAccountId(),
                request.amount(),
                request.description(),
                request.occurredAt())));
    }

    @GetMapping
    public ResponseEntity<List<TransferResponse>> list() {
        return ResponseEntity.ok(transferService.list().stream()
                .map(transferMapper::toResponse)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(transferMapper.toResponse(transferService.get(id)));
    }
}
