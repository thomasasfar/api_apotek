import {Unit} from "@prisma/client";

export interface CreateUnitRequest {
    name: string;
}

export interface UpdateUnitRequest {
    id: number;
    name: string;
}

export interface SearchUnitRequest {
    name?: string;
    page: number;
    size: number;
}

export interface UnitResponse {
    id: number;
    name: string;
}

export function toUnitResponse(unit: Unit): UnitResponse {
    return {
        id: unit.id,
        name: unit.name,
    }
}