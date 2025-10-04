package com.vitor.financas.service;

import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.repository.UserRepository;
import com.vitor.financas.service.exception.NotFoundException;
import com.vitor.financas.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new NotFoundException("Usuário não autenticado");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
    }
}
