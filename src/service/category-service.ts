import {
    CategoryResponse,
    CreateCategoryRequest, SearchCategoryRequest,
    toCategoryResponse,
    UpdateCategoryRequest
} from "../model/category-model";
import {validate} from "../validation/validation";
import {
    createCategoryValidation,
    getCategoryValidation, searchCategoryValidation,
    updateCategoryValidation
} from "../validation/category-validation";
import {prismaClient} from "../application/database";
import {Category} from "@prisma/client";
import {ResponseError} from "../error/response-error";
import {FilterConfig, Pageable} from "../model/page-model";
import {buildFilters} from "../helpers/filter-helper";

const create = async (request: CreateCategoryRequest): Promise<CategoryResponse> => {
    request = validate(createCategoryValidation, request);

    const duplicateCategory = await prismaClient.category.findFirst({
        where: {
            name: request.name
        }
    })

    if (duplicateCategory) {
        throw new ResponseError(400, 'Nama kategori telah digunakan')
    }

    const category = await prismaClient.category.create({
        data: request
    })

    return toCategoryResponse(category)
}

const categoryMustExist = async (id: number): Promise<Category> => {
    const category = await prismaClient.category.findUnique({
        where: {
            id: id
        }
    })

    if (!category) {
        throw new ResponseError(404, 'Kategori tidak ditemukan')
    }

    return category
}

const get = async (id: number): Promise<CategoryResponse> => {
    id = validate(getCategoryValidation, id)
    const category = await categoryMustExist(id)
    return toCategoryResponse(category)
}

const update = async (request: UpdateCategoryRequest): Promise<CategoryResponse> => {
    request = validate(updateCategoryValidation, request);

    await categoryMustExist(request.id)

    const duplicateCategory = await prismaClient.category.findFirst({
        where: {
            name: request.name,
            id: {
                not: request.id,
            },
        },
    });

    if (duplicateCategory) {
        throw new ResponseError(400, "Nama kategori sudah digunakan");
    }

    const category = await prismaClient.category.update({
        where: {
            id: request.id
        },
        data: request
    })

    return toCategoryResponse(category)
}

const remove = async (id: number): Promise<boolean> => {
    id = validate(getCategoryValidation, id)
    await categoryMustExist(id)

    await prismaClient.category.delete({
        where: {
            id: id
        }
    })

    return true
}

const search = async (request: SearchCategoryRequest): Promise<Pageable<CategoryResponse>> => {
    request = validate(searchCategoryValidation, request)

    const filterableFields: FilterConfig[] = [
        {key: 'name'},
        {key: 'description'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size

    const categories = await prismaClient.category.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.category.count({
        where: {
            AND: filters
        }
    })

    return {
        data: categories.map(category => toCategoryResponse(category)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    create,
    get,
    update,
    remove,
    search,
}