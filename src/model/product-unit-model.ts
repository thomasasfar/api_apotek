import {UnitConversionResponse} from "./unit-conversion-model";
import {UnitResponse} from "./unit-model";

export interface CreateProductUnit {
    unit_id: number;
    price: number;
    conversion_value?: number | null;
    is_default?: boolean;
}

export interface ProductUnitResponse {
    id: number;
    unit_id: number;
    price: number;
    is_default?: boolean | null;
    is_base?: boolean | null;
    unit?: UnitResponse;
    unitConversions?: UnitConversionResponse[];
}