import {Category} from "@prisma/client";

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    id: number;
    name: string;
    description?: string;
}

export interface SearchCategoryRequest {
    name?: string;
    description?: string;
    page: number;
    size: number;
}

export interface CategoryResponse {
    id: number;
    name: string;
    description?: string | null;
}

export function toCategoryResponse(category: Category): CategoryResponse {
    return {
        id: category.id,
        name: category.name,
        description: category.description,
    }
}