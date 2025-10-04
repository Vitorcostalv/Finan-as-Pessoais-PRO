package com.vitor.financas.service;

import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.repository.CategoryRepository;
import com.vitor.financas.domain.repository.TransactionRepository;
import com.vitor.financas.service.exception.ConflictException;
import com.vitor.financas.service.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public CategoryService(CategoryRepository categoryRepository,
                           TransactionRepository transactionRepository,
                           UserService userService) {
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Transactional
    public Category create(String name, String kind, String color) {
        User user = userService.getCurrentUser();
        if (categoryRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new ConflictException("Categoria já cadastrada");
        }
        Category category = Category.builder()
                .name(name)
                .kind(kind.toUpperCase())
                .color(color)
                .user(user)
                .createdAt(Instant.now())
                .build();
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> list() {
        User user = userService.getCurrentUser();
        return categoryRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Category get(UUID id) {
        User user = userService.getCurrentUser();
        return categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada"));
    }

    @Transactional
    public Category update(UUID id, String name, String color) {
        Category category = get(id);
        User user = category.getUser();
        if (!category.getName().equalsIgnoreCase(name) && categoryRepository.existsByUserAndNameIgnoreCase(user, name)) {
            throw new ConflictException("Categoria já cadastrada");
        }
        category.setName(name);
        category.setColor(color);
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(UUID id) {
        Category category = get(id);
        if (!transactionRepository.findNonTransferByCategory(category.getUser(), category).isEmpty()) {
            throw new ConflictException("Categoria em uso por transações");
        }
        categoryRepository.delete(category);
    }
}
