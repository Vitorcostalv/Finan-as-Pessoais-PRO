package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Budget;
import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.repository.BudgetRepository;
import com.vitor.financas.domain.repository.CategoryRepository;
import com.vitor.financas.service.exception.BusinessException;
import com.vitor.financas.service.exception.ConflictException;
import com.vitor.financas.service.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         UserService userService) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.userService = userService;
    }

    @Transactional
    public Budget create(UUID categoryId, LocalDate month, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor do budget deve ser positivo");
        }
        User user = userService.getCurrentUser();
        Category category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));
        LocalDate firstDay = month.withDayOfMonth(1);
        if (budgetRepository.existsByUserAndCategoryAndMonth(user, category, firstDay)) {
            throw new ConflictException("Budget já cadastrado para o mês");
        }
        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .month(firstDay)
                .amount(amount)
                .createdAt(Instant.now())
                .build();
        return budgetRepository.save(budget);
    }

    @Transactional(readOnly = true)
    public List<Budget> listByMonth(LocalDate month) {
        User user = userService.getCurrentUser();
        LocalDate firstDay = month.withDayOfMonth(1);
        return budgetRepository.findByUserAndMonth(user, firstDay);
    }

    @Transactional
    public Budget update(UUID id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor do budget deve ser positivo");
        }
        Budget budget = get(id);
        budget.setAmount(amount);
        return budgetRepository.save(budget);
    }

    @Transactional
    public void delete(UUID id) {
        Budget budget = get(id);
        budgetRepository.delete(budget);
    }

    @Transactional(readOnly = true)
    public Budget get(UUID id) {
        User user = userService.getCurrentUser();
        return budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Budget não encontrado"));
    }
}
