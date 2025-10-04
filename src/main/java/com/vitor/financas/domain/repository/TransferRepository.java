package com.vitor.financas.domain.repository;

import com.vitor.financas.domain.entity.Transfer;
import com.vitor.financas.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransferRepository extends JpaRepository<Transfer, UUID> {
    List<Transfer> findByUser(User user);
    Optional<Transfer> findByIdAndUser(UUID id, User user);
}
