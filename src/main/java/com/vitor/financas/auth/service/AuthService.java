package com.vitor.financas.auth.service;

import com.vitor.financas.auth.dto.AuthResponse;
import com.vitor.financas.auth.dto.LoginRequest;
import com.vitor.financas.auth.dto.SignupRequest;
import com.vitor.financas.auth.jwt.JwtTokenProvider;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.Role;
import com.vitor.financas.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        User user = User.builder()
                .name(request.name())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(Role.ROLE_USER))
                .createdAt(Instant.now())
                .build();
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, jwtTokenProvider.getExpirationSeconds());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }
        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, jwtTokenProvider.getExpirationSeconds());
    }
}
