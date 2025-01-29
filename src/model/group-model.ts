import {Group} from "@prisma/client";

export interface CreateGroupRequest {
    name: string;
    description?: string;
}

export interface UpdateGroupRequest {
    id: number;
    name: string;
    description?: string;
}

export interface SearchGroupRequest {
    name: string;
    description?: string;
    page: number;
    size: number;
}

export interface GroupResponse {
    id: number;
    name: string;
    description?: string | null;
}

export function toGroupResponse(group: Group): GroupResponse {
    return {
        id: group.id,
        name: group.name,
        description: group.description,
    }
}