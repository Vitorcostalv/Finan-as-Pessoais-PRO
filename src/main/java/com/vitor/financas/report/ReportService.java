package com.vitor.financas.report;

import com.vitor.financas.domain.entity.Transaction;
import com.vitor.financas.domain.entity.User;
import com.vitor.financas.domain.enums.TransactionType;
import com.vitor.financas.domain.repository.TransactionRepository;
import com.vitor.financas.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;

    public ReportService(TransactionRepository transactionRepository, UserService userService) {
        this.transactionRepository = transactionRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public PeriodSummary summarize(LocalDate start, LocalDate end) {
        List<Transaction> transactions = loadTransactions(start, end);
        BigDecimal totalIn = BigDecimal.ZERO;
        BigDecimal totalOut = BigDecimal.ZERO;
        for (Transaction transaction : transactions) {
            if (transaction.getType() == TransactionType.IN) {
                totalIn = totalIn.add(transaction.getAmount());
            } else {
                totalOut = totalOut.add(transaction.getAmount());
            }
        }
        BigDecimal net = totalIn.subtract(totalOut);
        return new PeriodSummary(totalIn, totalOut, net);
    }

    @Transactional(readOnly = true)
    public List<CategorySummary> summarizeByCategory(LocalDate start, LocalDate end) {
        List<Transaction> transactions = loadTransactions(start, end);
        Map<String, CategorySummary> totals = new LinkedHashMap<>();
        for (Transaction transaction : transactions) {
            if (transaction.getTransfer() != null || transaction.getCategory() == null) {
                continue;
            }
            String key = transaction.getCategory().getId().toString();
            CategorySummary current = totals.get(key);
            BigDecimal signed = transaction.getType() == TransactionType.IN
                    ? transaction.getAmount()
                    : transaction.getAmount().negate();
            if (current == null) {
                totals.put(key, new CategorySummary(
                        transaction.getCategory().getId(),
                        transaction.getCategory().getName(),
                        transaction.getCategory().getKind(),
                        signed));
            } else {
                totals.put(key, new CategorySummary(current.categoryId(), current.categoryName(), current.kind(), current.total().add(signed)));
            }
        }
        return new ArrayList<>(totals.values());
    }

    @Transactional(readOnly = true)
    public List<DailyCashFlowItem> dailyCashFlow(LocalDate start, LocalDate end) {
        List<Transaction> transactions = loadTransactions(start, end);
        Map<LocalDate, BigDecimal> totals = new LinkedHashMap<>();
        for (Transaction transaction : transactions) {
            LocalDate date = transaction.getOccurredAt().atZone(ZoneOffset.UTC).toLocalDate();
            BigDecimal current = totals.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal value = transaction.getType() == TransactionType.IN
                    ? current.add(transaction.getAmount())
                    : current.subtract(transaction.getAmount());
            totals.put(date, value);
        }
        List<DailyCashFlowItem> items = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            items.add(new DailyCashFlowItem(cursor, totals.getOrDefault(cursor, BigDecimal.ZERO)));
            cursor = cursor.plusDays(1);
        }
        return items;
    }

    private List<Transaction> loadTransactions(LocalDate start, LocalDate end) {
        User user = userService.getCurrentUser();
        Instant startInstant = start.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant endInstant = end.plusDays(1).atStartOfDay().minusNanos(1).toInstant(ZoneOffset.UTC);
        return transactionRepository.findByUserAndOccurredAtBetween(user, startInstant, endInstant);
    }
}
