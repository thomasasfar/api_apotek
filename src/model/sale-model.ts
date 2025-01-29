import {UserResponse} from "./user-model";
import {Sale} from "@prisma/client";
import {ProductResponse} from "./product-model";
import {ProductUnitResponse} from "./product-unit-model";
import {UnitResponse} from "./unit-model";
import {StockResponse} from "./stock-model";
import {DateRange} from "./page-model";

export interface SaleItems {
    product_id: number;
    quantity: number;
    product_unit_id: number;
}

export interface SaleStockResponse {
    sale_detail_index?: number;
    stock_id: number;
    quantity: number;
    stock?: StockResponse;
}

export interface SaleDetailResponse {
    id: number;
    sale_id: number;
    product_id: number;
    product_unit_id: number;
    quantity: number;
    price: number;
    product: ProductResponse;
    productUnit: ProductUnitResponse;
    saleStocks: SaleStockResponse[];
}

export interface CreateSaleRequest {
    user_id: number;
    total_payment: number;
    items: SaleItems[];
}

export interface SaleResponse {
    id: number;
    user_id: number;
    total_payment: number;
    change: number;
    saleDetails: SaleDetailResponse[];
    user: UserResponse;
    created_at?: Date;
    updated_at?: Date;
}

export interface SearchSaleRequest {
    user_id?: number;
    month?: string;
    date_range?: DateRange;
    size: number,
    page: number,
}

export type SaleWithDetail = Sale & {
    saleDetails: (SaleDetailResponse & {
        saleStocks: (SaleStockResponse & {
            stock: StockResponse
        })[];
        product: ProductResponse,
        productUnit: ProductUnitResponse & {
            unit: UnitResponse
        }
    })[];
    user: UserResponse;
}

export function toSaleResponse(
    sale: SaleWithDetail
): SaleResponse {
    return {
        id: sale.id,
        user_id: sale.user_id,
        total_payment: sale.total_payment,
        change: sale.change,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        saleDetails: sale.saleDetails.map((saleDetail) => ({
            id: saleDetail.id,
            sale_id: saleDetail.sale_id,
            product_id: saleDetail.product_id,
            product_unit_id: saleDetail.product_unit_id,
            quantity: saleDetail.quantity,
            price: saleDetail.price,
            product: {
                id: saleDetail.product.id,
                name: saleDetail.product.name,
                code: saleDetail.product.code
            },
            productUnit: {
                id: saleDetail.productUnit.id,
                price: saleDetail.productUnit.price,
                unit_id: saleDetail.productUnit.unit_id,
                unit: saleDetail.productUnit.unit
            },
            saleStocks: saleDetail.saleStocks.map((saleStock) => ({
                stock_id: saleStock.stock_id,
                quantity: saleStock.quantity,
                stock: {
                    id: saleStock.stock?.id,
                    batch_number: saleStock.stock?.batch_number,
                }
            }))
        })),
        user: {
            id: sale.user.id,
            name: sale.user.name,
            username: sale.user.username,
        },
    }
}