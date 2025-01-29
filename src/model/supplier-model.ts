import {Supplier} from "@prisma/client";

export interface CreateSupplierRequest {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    npwp?: string;
}

export interface UpdateSupplierRequest {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    npwp?: string;
}

export interface SupplierResponse {
    id: number;
    name: string;
    code?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    npwp?: string | null;
}

export interface SearchSupplierRequest {
    name?: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    npwp?: string;
    page: number;
    size: number;
}

export function toSupplierResponse(supplier: Supplier): SupplierResponse {
    return {
        id: supplier.id,
        name: supplier.name,
        code: supplier.code,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email,
        npwp: supplier.npwp
    };
}