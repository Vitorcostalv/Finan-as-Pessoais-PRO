package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.RuleRecurring;
import com.vitor.financas.web.dto.RecurringRuleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface RecurringRuleMapper {

    @Mapping(target = "accountId", source = "rule.account.id")
    @Mapping(target = "categoryId", source = "rule", qualifiedByName = "categoryId")
    RecurringRuleResponse toResponse(RuleRecurring rule);

    @Named("categoryId")
    default UUID mapCategoryId(RuleRecurring rule) {
        return rule.getCategory() != null ? rule.getCategory().getId() : null;
    }
}
