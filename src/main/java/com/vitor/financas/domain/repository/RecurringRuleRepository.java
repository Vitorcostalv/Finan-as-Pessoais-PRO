package com.vitor.financas.domain.repository;

import com.vitor.financas.domain.entity.RuleRecurring;
import com.vitor.financas.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringRuleRepository extends JpaRepository<RuleRecurring, UUID> {
    List<RuleRecurring> findByUserAndActiveTrueAndNextRunLessThanEqual(User user, LocalDate date);
    Optional<RuleRecurring> findByIdAndUser(UUID id, User user);
    List<RuleRecurring> findByActiveTrueAndNextRunLessThanEqual(LocalDate date);
}
