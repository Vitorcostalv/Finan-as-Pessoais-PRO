package com.vitor.financas.auth.jwt;

import com.vitor.financas.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collection;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final String secret;
    private final long expirationSeconds;

    public JwtTokenProvider(@Value("${app.security.jwt.secret}") String secret,
                            @Value("${app.security.jwt.expiration}") long expirationSeconds) {
        this.secret = secret;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Date expiry = Date.from(now.plusSeconds(expirationSeconds));
        return Jwts.builder()
                .setSubject(user.getId().toString())
                .setIssuedAt(Date.from(now))
                .setExpiration(expiry)
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("roles", user.getRoles())
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    public Authentication getAuthentication(String token, UserDetailsService userDetailsService) {
        UUID userId = getUserId(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(userId.toString());
        Collection<SimpleGrantedAuthority> authorities = userDetails.getAuthorities().stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                .collect(Collectors.toSet());
        return new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, token, authorities);
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getBody().getSubject());
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token);
    }
}
