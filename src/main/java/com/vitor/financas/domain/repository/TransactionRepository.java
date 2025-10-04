package com.vitor.financas.domain.repository;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.domain.entity.Transaction;
import com.vitor.financas.domain.entity.Transfer;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserAndOccurredAtBetween(User user, Instant start, Instant end);

    List<Transaction> findByUserAndAccountAndOccurredAtBetween(User user, Account account, Instant start, Instant end);

    @Query("select coalesce(sum(case when t.type = 'IN' then t.amount else t.amount * -1 end), 0) from Transaction t " +
            "where t.user = :user and t.account = :account")
    BigDecimal computeAccountBalance(@Param("user") User user, @Param("account") Account account);

    @Query("select coalesce(sum(case when t.type = 'IN' then t.amount else -t.amount end), 0) " +
            "from Transaction t where t.user = :user and t.category = :category and t.transfer is null and t.occurredAt between :start and :end")
    BigDecimal sumByCategoryAndPeriod(@Param("user") User user,
                                      @Param("category") Category category,
                                      @Param("start") Instant start,
                                      @Param("end") Instant end);

    boolean existsByUserAndAccountAndTypeAndReferenceCode(User user, Account account, TransactionType type, String referenceCode);

    List<Transaction> findByTransfer(Transfer transfer);

    @Query("select t from Transaction t where t.user = :user and t.transfer is null and t.category = :category")
    List<Transaction> findNonTransferByCategory(@Param("user") User user, @Param("category") Category category);

    Optional<Transaction> findByUserAndReferenceCode(User user, String referenceCode);

    boolean existsByAccount(Account account);
}
