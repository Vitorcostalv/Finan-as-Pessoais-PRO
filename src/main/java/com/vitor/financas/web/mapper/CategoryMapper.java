package com.vitor.financas.web.mapper;

import com.vitor.financas.domain.entity.Category;
import com.vitor.financas.web.dto.CategoryResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}
