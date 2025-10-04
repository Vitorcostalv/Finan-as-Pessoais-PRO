package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.Account;
import com.vitor.financas.web.dto.AccountResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    @Mapping(target = "id", source = "account.id")
    @Mapping(target = "name", source = "account.name")
    @Mapping(target = "type", source = "account.type")
    @Mapping(target = "initialBalance", source = "account.initialBalance")
    @Mapping(target = "createdAt", source = "account.createdAt")
    @Mapping(target = "balance", source = "balance")
    AccountResponse toResponse(Account account, BigDecimal balance);
}
