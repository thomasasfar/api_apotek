import {
    CreateUnitRequest,
    SearchUnitRequest,
    toUnitResponse,
    UnitResponse,
    UpdateUnitRequest
} from "../model/unit-model";
import {validate} from "../validation/validation";
import {
    createUnitValidation,
    getUnitValidation,
    searchUnitValidation,
    updateUnitValidation
} from "../validation/unit-validation";
import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";
import {Unit} from "@prisma/client";
import {Pageable} from "../model/page-model";
import {buildFilters} from "../helpers/filter-helper";

const create = async (request: CreateUnitRequest): Promise<UnitResponse> => {
    request = validate(createUnitValidation, request);

    const duplicateUnit = await prismaClient.unit.findUnique({
        where: {
            name: request.name,
        }
    })

    if (duplicateUnit) {
        throw new ResponseError(400, "Nama unit telah digunakan")
    }

    const unit = await prismaClient.unit.create({
        data: request,
    })

    return toUnitResponse(unit)
}

const unitMustExist = async (id: number): Promise<Unit> => {
    const unit = await prismaClient.unit.findUnique({
        where: {
            id: id
        }
    })

    if (!unit) {
        throw new ResponseError(404, "Unit tidak ditemukan")
    }

    return unit
}

const get = async (id: number): Promise<UnitResponse> => {
    id = validate(getUnitValidation, id)
    const unit = await unitMustExist(id)
    return toUnitResponse(unit)
}

const update = async (request: UpdateUnitRequest): Promise<UnitResponse> => {
    request = validate(updateUnitValidation, request);
    await unitMustExist(request.id)

    const duplicateUnit = await prismaClient.unit.findFirst({
        where: {
            name: request.name,
            id: {
                not: request.id
            }
        },
    })

    if (duplicateUnit) {
        throw new ResponseError(400, "Nama unit telah digunakan")
    }

    const unit = await prismaClient.unit.update({
        where: {
            id: request.id
        },
        data: request
    })

    return toUnitResponse(unit)
}

const remove = async (id: number): Promise<boolean> => {
    id = validate(getUnitValidation, id)
    await unitMustExist(id)

    await prismaClient.unit.delete({
        where: {
            id: id
        }
    })

    return true
}

const search = async (request: SearchUnitRequest): Promise<Pageable<UnitResponse>> => {
    request = validate(searchUnitValidation, request);

    const filterableFields = [
        {key: 'name'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size

    const units = await prismaClient.unit.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.unit.count({
        where: {
            AND: filters
        }
    })

    return {
        data: units.map(category => toUnitResponse(category)),
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
    search
}