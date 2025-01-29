import {
    CreateGroupRequest,
    GroupResponse,
    SearchGroupRequest,
    toGroupResponse,
    UpdateGroupRequest
} from "../model/group-model";
import {validate} from "../validation/validation";
import {
    createGroupValidation,
    getGroupValidation,
    searchGroupValidation,
    updateGroupValidation
} from "../validation/group-validation";
import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";
import {Group} from "@prisma/client";
import {Pageable} from "../model/page-model";
import {buildFilters} from "../helpers/filter-helper";

const create = async (request: CreateGroupRequest): Promise<GroupResponse> => {
    request = validate(createGroupValidation, request)

    const duplicateGroup = await prismaClient.group.findUnique({
        where: {
            name: request.name
        }
    })

    if (duplicateGroup) {
        throw new ResponseError(400, "Nama kelompok telah digunakan")
    }

    const group = await prismaClient.group.create({
        data: request
    })

    return toGroupResponse(group)
}

const groupMustExist = async (id: number): Promise<Group> => {
    const group = await prismaClient.group.findUnique({
        where: {
            id: id
        }
    })

    if (!group) {
        throw new ResponseError(404, "Kelompok tidak ditemukan")
    }

    return group
}

const get = async (id: number): Promise<GroupResponse> => {
    id = validate(getGroupValidation, id)
    const group = await groupMustExist(id)
    return toGroupResponse(group)
}

const update = async (request: UpdateGroupRequest): Promise<GroupResponse> => {
    request = validate(updateGroupValidation, request)
    await groupMustExist(request.id)

    const duplicateGroup = await prismaClient.group.findFirst({
        where: {
            name: request.name,
            id: {
                not: request.id
            }
        }
    })

    if (duplicateGroup) {
        throw new ResponseError(400, "Nama kelompok telah digunakan")
    }

    const group = await prismaClient.group.update({
        where: {
            id: request.id
        },
        data: request
    })

    return toGroupResponse(group)
}

const remove = async (id: number): Promise<boolean> => {
    id = validate(getGroupValidation, id)
    await groupMustExist(id)

    await prismaClient.group.delete({
        where: {
            id: id
        }
    })

    return true
}

const search = async (request: SearchGroupRequest): Promise<Pageable<GroupResponse>> => {
    request = validate(searchGroupValidation, request)

    const filterableFields = [
        {key: 'name'},
        {key: 'description'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size

    const groups = await prismaClient.group.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.group.count({
        where: {
            AND: filters
        }
    })

    return {
        data: groups.map(group => toGroupResponse(group)),
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