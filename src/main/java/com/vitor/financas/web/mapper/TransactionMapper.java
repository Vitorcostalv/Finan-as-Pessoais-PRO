package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.Transaction;
import com.vitor.financas.web.dto.TransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(target = "accountId", source = "transaction.account.id")
    @Mapping(target = "categoryId", source = "transaction", qualifiedByName = "categoryId")
    TransactionResponse toResponse(Transaction transaction);

    @Named("categoryId")
    default UUID mapCategoryId(Transaction transaction) {
        return transaction.getCategory() != null ? transaction.getCategory().getId() : null;
    }
}
