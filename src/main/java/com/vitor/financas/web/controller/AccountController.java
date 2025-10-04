package com.vitor.financas.web.controller;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.service.AccountService;
import com.vitor.financas.service.TransactionService;
import com.vitor.financas.web.dto.AccountRequest;
import com.vitor.financas.web.dto.AccountResponse;
import com.vitor.financas.web.dto.AccountUpdateRequest;
import com.vitor.financas.web.mapper.AccountMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;
    private final AccountMapper accountMapper;

    public AccountController(AccountService accountService,
                             TransactionService transactionService,
                             AccountMapper accountMapper) {
        this.accountService = accountService;
        this.transactionService = transactionService;
        this.accountMapper = accountMapper;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountRequest request) {
        Account account = accountService.create(request.name(), request.initialBalance(), request.type());
        AccountResponse response = accountMapper.toResponse(account, transactionService.computeAccountBalance(account));
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> list() {
        List<AccountResponse> responses = accountService.list().stream()
                .map(account -> accountMapper.toResponse(account, transactionService.computeAccountBalance(account)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> get(@PathVariable UUID id) {
        Account account = accountService.get(id);
        return ResponseEntity.ok(accountMapper.toResponse(account, transactionService.computeAccountBalance(account)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AccountResponse> rename(@PathVariable UUID id, @Valid @RequestBody AccountUpdateRequest request) {
        Account account = accountService.rename(id, request.name());
        return ResponseEntity.ok(accountMapper.toResponse(account, transactionService.computeAccountBalance(account)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
