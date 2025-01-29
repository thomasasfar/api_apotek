import {ProductResponse} from "./product-model";
import {Stock} from "@prisma/client";

export interface StockResponse {
    id?: number;
    product_id?: number;
    batch_number?: string | null;
    expired_date?: Date | null;
    quantity?: number;
    created_at?: Date;
    updated_at?: Date;
    product?: ProductResponse | null;
}

export interface SearchStockRequest {
    product?: string;
    batch_number?: string;
    before_expired?: number;
    size: number;
    page: number;
}

export function toStockResponse(
    stock: Stock & {
        product: ProductResponse
    }
): StockResponse {
    return {
        id: stock.id,
        product_id: stock.product_id,
        batch_number: stock.batch_number,
        expired_date: stock.expired_date,
        quantity: stock.quantity,
        created_at: stock.created_at,
        updated_at: stock.updated_at,
        product: {
            id: stock.product.id,
            name: stock.product.name,
            code: stock.product.code,
        }
    }
}