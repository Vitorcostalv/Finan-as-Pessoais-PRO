package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.Transfer;
import com.vitor.financas.web.dto.TransferResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransferMapper {

    @Mapping(target = "fromAccountId", source = "transfer.fromAccount.id")
    @Mapping(target = "toAccountId", source = "transfer.toAccount.id")
    TransferResponse toResponse(Transfer transfer);
}
