package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.domain.entity.Transfer;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.TransactionType;
import com.vitor.financas.domain.repository.AccountRepository;
import com.vitor.financas.domain.repository.TransferRepository;
import com.vitor.financas.service.exception.BusinessException;
import com.vitor.financas.service.exception.NotFoundException;
import com.vitor.financas.util.IdempotencyUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final TransactionService transactionService;
    private final UserService userService;

    public TransferService(TransferRepository transferRepository,
                           AccountRepository accountRepository,
                           TransactionService transactionService,
                           UserService userService) {
        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
        this.transactionService = transactionService;
        this.userService = userService;
    }

    @Transactional
    public Transfer create(UUID fromAccountId, UUID toAccountId, BigDecimal amount, String description, Instant occurredAt) {
        if (fromAccountId.equals(toAccountId)) {
            throw new BusinessException("Contas de origem e destino devem ser diferentes");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor da transferência deve ser positivo");
        }
        User user = userService.getCurrentUser();
        Account from = accountRepository.findByIdAndUser(fromAccountId, user)
                .orElseThrow(() -> new NotFoundException("Conta de origem não encontrada"));
        Account to = accountRepository.findByIdAndUser(toAccountId, user)
                .orElseThrow(() -> new NotFoundException("Conta de destino não encontrada"));
        Transfer transfer = Transfer.builder()
                .user(user)
                .fromAccount(from)
                .toAccount(to)
                .amount(amount)
                .description(description)
                .occurredAt(occurredAt)
                .createdAt(Instant.now())
                .build();
        transferRepository.save(transfer);

        String referenceOut = IdempotencyUtils.deterministicCode("transfer-out-" + transfer.getId());
        String referenceIn = IdempotencyUtils.deterministicCode("transfer-in-" + transfer.getId());

        transactionService.createTransferEntry(transfer, from, null, TransactionType.OUT, amount,
                description != null ? description : "Transferência para " + to.getName(), occurredAt, referenceOut);
        transactionService.createTransferEntry(transfer, to, null, TransactionType.IN, amount,
                description != null ? description : "Transferência de " + from.getName(), occurredAt, referenceIn);
        transferRepository.save(transfer);
        return transfer;
    }

    @Transactional(readOnly = true)
    public List<Transfer> list() {
        User user = userService.getCurrentUser();
        return transferRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Transfer get(UUID id) {
        User user = userService.getCurrentUser();
        return transferRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Transferência não encontrada"));
    }
}
