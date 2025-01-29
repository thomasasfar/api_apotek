import {StockResponse} from "./stock-model";
import {ProductUnit, Purchase, PurchaseDetail, Stock, Supplier, Unit} from "@prisma/client";
import {ProductUnitResponse} from "./product-unit-model";
import {SupplierResponse} from "./supplier-model";
import {UserResponse} from "./user-model";

export interface purchaseDetailRequest {
    product_id: number;
    product_unit_id: number;
    amount: number;
    batch_number?: string;
    expired_date?: Date;
    price: number;
}

export interface CreatePurchaseRequest {
    code: string,
    supplier_id: number,
    user_id: number,
    purchase_date: Date,
    note?: string,
    items: purchaseDetailRequest[],
}

export interface SearchPurchaseRequest {
    code?: string;
    supplier_id?: number;
    user_id?: number;
    month?: string;
    page: number;
    size: number;
}

export interface SearchPurchaseResponse {
    id: number;
    code: string;
    supplier_id: number;
    user_id: number;
    purchase_date: Date;
    supplier: SupplierResponse;
    user: UserResponse
}

export interface purchaseDetailResponse {
    purchase_id: number;
    stock_id: number;
    amount: number;
    price: number;
    product_unit_id: number;
    stock: StockResponse;
    productUnit?: ProductUnitResponse;
}

export interface PurchaseResponse {
    id: number;
    code: string;
    supplier_id: number;
    user_id: number;
    purchase_date: Date;
    note?: string | null;
    created_at: Date;
    updated_at: Date;
    purchaseDetails: purchaseDetailResponse[];
    supplier: SupplierResponse;
}

export type PurchaseWithDetail = Purchase & {
    purchaseDetails: (PurchaseDetail & {
        stock: Stock;
        productUnit: (ProductUnit & {
            unit: Unit
        })
    })[];
    supplier: Supplier;
}

export function toPurchaseRespons(
    purchase: PurchaseWithDetail
): PurchaseResponse {
    return {
        id: purchase.id,
        code: purchase.code,
        supplier_id: purchase.supplier_id,
        user_id: purchase.user_id,
        purchase_date: purchase.purchase_date,
        note: purchase.note,
        created_at: purchase.created_at,
        updated_at: purchase.updated_at,
        supplier: {
            id: purchase.supplier.id,
            name: purchase.supplier.name
        },
        purchaseDetails: purchase.purchaseDetails.map((detail) => ({
            purchase_id: detail.purchase_id,
            stock_id: detail.stock_id,
            amount: detail.amount,
            price: detail.price,
            product_unit_id: detail.product_unit_id,
            stock: {
                id: detail.stock.id,
                product_id: detail.stock.product_id,
                batch_number: detail.stock.batch_number,
                expired_date: detail.stock.expired_date,
                quantity: detail.stock.quantity,
                created_at: detail.stock.created_at,
                updated_at: detail.stock.updated_at,
            },
            productUnit: {
                id: detail.productUnit.id,
                unit_id: detail.productUnit.unit_id,
                price: detail.productUnit.price,
                is_default: detail.productUnit.is_default,
                is_base: detail.productUnit.is_base,
                unit: {
                    id: detail.productUnit.unit.id,
                    name: detail.productUnit.unit.name,
                }
            }
        })),
    }
}

export function toSearchPurchaseResponse(
    purchase: SearchPurchaseResponse & {
        user: UserResponse;
        supplier: SupplierResponse
    }
): SearchPurchaseResponse {
    return {
        id: purchase.id,
        code: purchase.code,
        supplier_id: purchase.supplier_id,
        user_id: purchase.user_id,
        purchase_date: purchase.purchase_date,
        supplier: {
            id: purchase.supplier.id,
            name: purchase.supplier.name
        },
        user: {
            id: purchase.user.id,
            username: purchase.user.username,
            name: purchase.user.name,
        }
    }
}