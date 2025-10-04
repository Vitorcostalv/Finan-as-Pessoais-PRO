package com.vitor.financas.auth.dto;

public record AuthResponse(String accessToken, long expiresIn) {
}
