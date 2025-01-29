import {Roles, User} from "@prisma/client";

export interface CreateUserRequest {
    username: string;
    name: string;
    password: string;
    confirmPassword: string;
    role: Roles;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SearchUserRequest {
    page: number;
    size: number;
    name?: string;
    username?: string;
    role?: string;
}

export interface UserResponse {
    id: number;
    username: string;
    name: string;
    role?: string | null;
    token?: string | null;
}

export function toUserResponse(user: User): UserResponse {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
    };
}