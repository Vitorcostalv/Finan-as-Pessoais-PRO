package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.Budget;
import com.vitor.financas.web.dto.BudgetResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BudgetMapper {

    @Mapping(target = "categoryId", source = "budget.category.id")
    BudgetResponse toResponse(Budget budget);
}
