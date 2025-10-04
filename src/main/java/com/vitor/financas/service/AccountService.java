package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.repository.AccountRepository;
import com.vitor.financas.domain.repository.TransactionRepository;
import com.vitor.financas.service.exception.ConflictException;
import com.vitor.financas.service.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public AccountService(AccountRepository accountRepository,
                          TransactionRepository transactionRepository,
                          UserService userService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Transactional
    public Account create(String name, BigDecimal initialBalance, String type) {
        User user = userService.getCurrentUser();
        if (accountRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new ConflictException("Conta já cadastrada");
        }
        Account account = Account.builder()
                .name(name)
                .initialBalance(initialBalance)
                .type(type)
                .user(user)
                .createdAt(Instant.now())
                .build();
        return accountRepository.save(account);
    }

    @Transactional(readOnly = true)
    public List<Account> list() {
        User user = userService.getCurrentUser();
        return accountRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Account get(UUID id) {
        User user = userService.getCurrentUser();
        return accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada"));
    }

    @Transactional
    public Account rename(UUID id, String name) {
        Account account = get(id);
        User user = account.getUser();
        if (!account.getName().equalsIgnoreCase(name) && accountRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new ConflictException("Conta já cadastrada");
        }
        account.setName(name);
        return accountRepository.save(account);
    }

    @Transactional
    public void delete(UUID id) {
        Account account = get(id);
        if (transactionRepository.existsByAccount(account)) {
            throw new ConflictException("Conta possui transações vinculadas");
        }
        accountRepository.delete(account);
    }
}
