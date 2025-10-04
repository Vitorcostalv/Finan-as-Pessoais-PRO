package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.RuleRecurring;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.Frequency;
import com.vitor.financas.domain.enums.TransactionType;
import com.vitor.financas.domain.repository.AccountRepository;
import com.vitor.financas.domain.repository.CategoryRepository;
import com.vitor.financas.domain.repository.RecurringRuleRepository;
import com.vitor.financas.service.exception.BusinessException;
import com.vitor.financas.service.exception.NotFoundException;
import com.vitor.financas.util.IdempotencyUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class RecurringRuleService {

    private final RecurringRuleRepository recurringRuleRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionService transactionService;
    private final UserService userService;

    public RecurringRuleService(RecurringRuleRepository recurringRuleRepository,
                                AccountRepository accountRepository,
                                CategoryRepository categoryRepository,
                                TransactionService transactionService,
                                UserService userService) {
        this.recurringRuleRepository = recurringRuleRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionService = transactionService;
        this.userService = userService;
    }

    @Transactional
    public RuleRecurring create(UUID accountId, UUID categoryId, TransactionType baseType, BigDecimal baseAmount,
                                String descriptionTemplate, Frequency frequency, LocalDate nextRun) {
        if (baseAmount == null || baseAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor base deve ser positivo");
        }
        User user = userService.getCurrentUser();
        Account account = accountRepository.findByIdAndUser(accountId, user)
                .orElseThrow(() -> new NotFoundException("Conta não encontrada"));
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findByIdAndUser(categoryId, user)
                    .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));
            validateCategory(baseType, category);
        }
        RuleRecurring rule = RuleRecurring.builder()
                .user(user)
                .account(account)
                .category(category)
                .baseType(baseType)
                .baseAmount(baseAmount)
                .descriptionTemplate(descriptionTemplate)
                .frequency(frequency)
                .nextRun(nextRun)
                .active(true)
                .createdAt(Instant.now())
                .build();
        return recurringRuleRepository.save(rule);
    }

    @Transactional(readOnly = true)
    public List<RuleRecurring> listActive() {
        User user = userService.getCurrentUser();
        return recurringRuleRepository.findByUserAndActiveTrueAndNextRunLessThanEqual(user, LocalDate.MAX);
    }

    @Transactional
    public RuleRecurring deactivate(UUID id) {
        RuleRecurring rule = get(id);
        rule.setActive(false);
        return recurringRuleRepository.save(rule);
    }

    @Transactional(readOnly = true)
    public RuleRecurring get(UUID id) {
        User user = userService.getCurrentUser();
        return recurringRuleRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Regra não encontrada"));
    }

    @Transactional
    public void processDueRules(LocalDate referenceDate) {
        List<RuleRecurring> rules = recurringRuleRepository.findByActiveTrueAndNextRunLessThanEqual(referenceDate);
        for (RuleRecurring rule : rules) {
            createIfNotExists(rule);
            rule.setNextRun(calculateNextRun(rule.getNextRun(), rule.getFrequency()));
            recurringRuleRepository.save(rule);
        }
    }

    private void createIfNotExists(RuleRecurring rule) {
        LocalDate runDate = rule.getNextRun();
        String reference = IdempotencyUtils.deterministicCode("recurring-" + rule.getId() + "-" + runDate);
        if (transactionService.existsByReference(rule.getUser(), reference)) {
            return;
        }
        String description = rule.getDescriptionTemplate() != null ?
                rule.getDescriptionTemplate().replace("{date}", runDate.toString()) :
                "Lançamento recorrente";
        transactionService.createRecurring(rule.getUser(),
                rule.getAccount(),
                rule.getCategory(),
                rule.getBaseType(),
                rule.getBaseAmount(),
                description,
                runDate.atStartOfDay().toInstant(java.time.ZoneOffset.UTC),
                reference);
    }

    private LocalDate calculateNextRun(LocalDate current, Frequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
        };
    }

    private void validateCategory(TransactionType baseType, Category category) {
        if (baseType == TransactionType.IN && "EXPENSE".equalsIgnoreCase(category.getKind())) {
            throw new BusinessException("Categoria de despesa não pode ser usada em entrada");
        }
        if (baseType == TransactionType.OUT && "INCOME".equalsIgnoreCase(category.getKind())) {
            throw new BusinessException("Categoria de receita não pode ser usada em saída");
        }
    }
}
