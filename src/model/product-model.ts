import {CreateProductUnit, ProductUnitResponse} from "./product-unit-model";
import {Category, Group, Product, ProductUnit, Unit, UnitConversion} from "@prisma/client";
import {CategoryResponse} from "./category-model";
import {GroupResponse} from "./group-model";

export interface CreateProductRequest {
    name: string;
    code: string;
    minimum_stock: number;
    allow_sale_before_expired?: number;
    description?: string;
    indication?: string;
    contraindication?: string;
    side_effects?: string;
    content?: string;
    dose?: string;
    category_id: number;
    group_id: number;
    productUnits: CreateProductUnit[];
}

export interface UpdateProductRequest {
    id: number;
    name: string;
    code: string;
    minimum_stock: number;
    allow_sale_before_expired?: number;
    description?: string;
    indication?: string;
    contraindication?: string;
    side_effects?: string;
    content?: string;
    dose?: string;
    category_id: number;
    group_id: number;
    productUnits: CreateProductUnit[];
}

export interface ProductResponse {
    id: number;
    name: string;
    code: string;
    minimum_stock?: number;
    allow_sale_before_expired?: number;
    description?: string | null;
    indication?: string | null;
    contraindication?: string | null;
    side_effects?: string | null;
    content?: string | null;
    dose?: string | null;
    category_id?: number;
    group_id?: number;
    productUnits?: ProductUnitResponse[];
}

export interface SearchProductRequest {
    name?: string;
    code?: string;
    category_id?: number;
    group_id?: number;
    minimum_stock?: number;
    allow_sale_before_expired?: number;
    page: number;
    size: number;
}

export interface SearchProductResponse {
    id: number;
    name: string;
    code: string;
    minimum_stock: number;
    allow_sale_before_expired: number;
    category_id: number;
    group_id: number;
    category: CategoryResponse;
    group: GroupResponse;
}

export type ProductWithUnits = Product & {
    productUnits: Array<
        ProductUnit & {
        fromUnitConversions: UnitConversion[];
        unit: Unit;
    }
    >;
};


export function toProductResponse(
    product: ProductWithUnits
): ProductResponse {
    return {
        id: product.id,
        name: product.name,
        code: product.code,
        minimum_stock: product.minimum_stock,
        allow_sale_before_expired: product.allow_sale_before_expired,
        description: product.description,
        indication: product.indication,
        contraindication: product.contraindication,
        side_effects: product.side_effects,
        content: product.content,
        dose: product.dose,
        category_id: product.category_id,
        group_id: product.group_id,
        productUnits: product.productUnits.map((productUnit) => ({
            id: productUnit.id,
            unit_id: productUnit.unit_id,
            price: productUnit.price,
            is_default: productUnit.is_default,
            is_base: productUnit.is_base,
            unit: productUnit.unit,
            unitConversions: [
                ...productUnit.fromUnitConversions.map((conv) => ({
                    id: conv.id,
                    from_product_unit_id: conv.from_product_unit_id,
                    to_product_unit_id: conv.to_product_unit_id,
                    conversion_value: conv.conversion_value,
                })),
            ],
        })),
    }
}

export function toSearchProductResponse(
    product: SearchProductResponse & {
        group: Group;
        category: Category;
    }
): SearchProductResponse {
    return {
        id: product.id,
        code: product.code,
        name: product.name,
        minimum_stock: product.minimum_stock,
        allow_sale_before_expired: product.allow_sale_before_expired,
        category_id: product.category_id,
        group_id: product.group_id,
        group: product.group,
        category: product.category
    }
}