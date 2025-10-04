package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.Transaction;
import com.vitor.financas.domain.entity.Transfer;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.TransactionType;
import com.vitor.financas.domain.repository.AccountRepository;
import com.vitor.financas.domain.repository.CategoryRepository;
import com.vitor.financas.domain.repository.TransactionRepository;
import com.vitor.financas.service.exception.BusinessException;
import com.vitor.financas.service.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CategoryRepository categoryRepository,
                              UserService userService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Transactional
    public Transaction create(UUID accountId, UUID categoryId, TransactionType type, BigDecimal amount, String description, Instant occurredAt) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor da transação deve ser positivo");
        }
        User user = userService.getCurrentUser();
        Account account = accountRepository.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada"));
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findByIdAndUser(categoryId, user)
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));
            validateCategory(type, category);
        }
        return createInternal(user, account, category, type, amount, description, occurredAt, null);
    }

    private void validateCategory(TransactionType type, Category category) {
        if (type == TransactionType.IN && "EXPENSE".equalsIgnoreCase(category.getKind())) {
            throw new BusinessException("Categoria de despesa não pode ser usada em entrada");
        }
        if (type == TransactionType.OUT && "INCOME".equalsIgnoreCase(category.getKind())) {
            throw new BusinessException("Categoria de receita não pode ser usada em saída");
        }
    }

    @Transactional(readOnly = true)
    public List<Transaction> list(LocalDate start, LocalDate end) {
        User user = userService.getCurrentUser();
        Instant startInstant = start.atStartOfDay().toInstant(java.time.ZoneOffset.UTC);
        Instant endInstant = end.plusDays(1).atStartOfDay().minusNanos(1).toInstant(java.time.ZoneOffset.UTC);
        return transactionRepository.findByUserAndOccurredAtBetween(user, startInstant, endInstant);
    }

    @Transactional(readOnly = true)
    public Transaction get(UUID id) {
        User user = userService.getCurrentUser();
        return transactionRepository.findById(id)
                .filter(transaction -> transaction.getUser().equals(user))
                .orElseThrow(() -> new NotFoundException("Transação não encontrada"));
    }

    @Transactional
    public void delete(UUID id) {
        Transaction transaction = get(id);
        if (transaction.getTransfer() != null) {
            throw new BusinessException("Transações geradas por transferência não podem ser removidas isoladamente");
        }
        transactionRepository.delete(transaction);
    }

    @Transactional
    public Transaction createTransferEntry(Transfer transfer, Account account, Category category, TransactionType type, BigDecimal amount, String description, Instant occurredAt, String referenceCode) {
        return createInternal(transfer.getUser(), account, category, type, amount, description, occurredAt, referenceCode, transfer);
    }

    @Transactional(readOnly = true)
    public BigDecimal sumByCategory(Category category, Instant start, Instant end) {
        return transactionRepository.sumByCategoryAndPeriod(category.getUser(), category, start, end);
    }

    @Transactional(readOnly = true)
    public BigDecimal computeAccountBalance(Account account) {
        BigDecimal delta = transactionRepository.computeAccountBalance(account.getUser(), account);
        if (delta == null) {
            delta = BigDecimal.ZERO;
        }
        return account.getInitialBalance().add(delta);
    }

    @Transactional(readOnly = true)
    public boolean existsByReference(User user, String referenceCode) {
        return transactionRepository.findByUserAndReferenceCode(user, referenceCode).isPresent();
    }

    @Transactional
    public Transaction createRecurring(User user, Account account, Category category, TransactionType type, BigDecimal amount,
                                       String description, Instant occurredAt, String referenceCode) {
        return createInternal(user, account, category, type, amount, description, occurredAt, referenceCode);
    }

    private Transaction createInternal(User user, Account account, Category category, TransactionType type, BigDecimal amount,
                                       String description, Instant occurredAt, String referenceCode) {
        return createInternal(user, account, category, type, amount, description, occurredAt, referenceCode, null);
    }

    private Transaction createInternal(User user, Account account, Category category, TransactionType type, BigDecimal amount,
                                       String description, Instant occurredAt, String referenceCode, Transfer transfer) {
        Transaction transaction = Transaction.builder()
                .account(account)
                .category(category)
                .user(user)
                .transfer(transfer)
                .type(type)
                .amount(amount)
                .description(description)
                .occurredAt(occurredAt)
                .referenceCode(referenceCode)
                .createdAt(Instant.now())
                .build();
        return transactionRepository.save(transaction);
    }
}
