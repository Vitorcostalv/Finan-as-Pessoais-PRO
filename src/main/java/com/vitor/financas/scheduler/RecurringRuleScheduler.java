package com.vitor.financas.scheduler;

import com.vitor.financas.service.RecurringRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class RecurringRuleScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecurringRuleScheduler.class);
    private final RecurringRuleService recurringRuleService;

    public RecurringRuleScheduler(RecurringRuleService recurringRuleService) {
        this.recurringRuleService = recurringRuleService;
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void generateRecurringTransactions() {
        LOGGER.info("Executando geração de lançamentos recorrentes para {}", LocalDate.now());
        recurringRuleService.processDueRules(LocalDate.now());
    }
}
