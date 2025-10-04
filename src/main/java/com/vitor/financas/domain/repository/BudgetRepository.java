package com.vitor.financas.domain.repository;

import com.vitor.financas.domain.entity.Budget;
import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserAndMonth(User user, LocalDate month);
    Optional<Budget> findByIdAndUser(UUID id, User user);
    boolean existsByUserAndCategoryAndMonth(User user, Category category, LocalDate month);
}
