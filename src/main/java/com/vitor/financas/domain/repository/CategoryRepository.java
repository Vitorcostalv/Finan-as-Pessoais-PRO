package com.vitor.financas.domain.repository;

import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUser(User user);
    Optional<Category> findByIdAndUser(UUID id, User user);
    boolean existsByUserAndNameIgnoreCase(User user, String name);
}
