import {
    CreateSupplierRequest, SearchSupplierRequest,
    SupplierResponse,
    toSupplierResponse,
    UpdateSupplierRequest
} from "../model/supplier-model";
import {validate} from "../validation/validation";
import {
    createSupplierValidation,
    getSupplierValidation, searchSupplierValidation,
    updateSupplierValidation
} from "../validation/supplier-validation";
import {prismaClient} from "../application/database";
import {Supplier} from "@prisma/client";
import {ResponseError} from "../error/response-error";
import {buildFilters} from "../helpers/filter-helper";
import {Pageable} from "../model/page-model";

const create = async (request: CreateSupplierRequest): Promise<SupplierResponse> => {
    request = validate(createSupplierValidation, request);

    const lastSupplier = await prismaClient.supplier.findFirst({
        orderBy: {
            code: 'desc'
        }
    });

    let newCode = 'SUP-0001';

    if (lastSupplier) {
        const lastNumber = parseInt(lastSupplier.code.split('-')[1], 10);
        newCode = `SUP-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    request.code = newCode;

    const supplier = await prismaClient.supplier.create({
        data: request,
    })

    return toSupplierResponse(supplier)
}

const supplierMustExist = async (id: number): Promise<Supplier> => {
    const supplier = await prismaClient.supplier.findUnique({
        where: {
            id: id
        }
    })

    if (!supplier) {
        throw new ResponseError(404, "Supplier tidak ditemukan")
    }

    return supplier
}

const get = async (id: number): Promise<SupplierResponse> => {
    id = validate(getSupplierValidation, id)
    const supplier = await supplierMustExist(id)
    return toSupplierResponse(supplier)
}

const update = async (request: UpdateSupplierRequest): Promise<SupplierResponse> => {
    request = validate(updateSupplierValidation, request);
    await supplierMustExist(request.id)

    const supplier = await prismaClient.supplier.update({
        where: {
            id: request.id
        },
        data: request
    })

    return toSupplierResponse(supplier)
}

const remove = async (id: number): Promise<boolean> => {
    id = validate(getSupplierValidation, id)
    await supplierMustExist(id)

    return true;
}

const search = async (request: SearchSupplierRequest): Promise<Pageable<SupplierResponse>> => {
    request = validate(searchSupplierValidation, request);

    const filterableFields = [
        {key: 'name'},
        {key: 'code'},
        {key: 'address'},
        {key: 'phone'},
        {key: 'email'},
        {key: 'npwp'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size

    const suppliers = await prismaClient.supplier.findMany({
        where: {
            AND: filters
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.supplier.count({
        where: {
            AND: filters
        }
    });

    return {
        data: suppliers.map(supplier => toSupplierResponse(supplier)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    create,
    supplierMustExist,
    get,
    update,
    remove,
    search
}