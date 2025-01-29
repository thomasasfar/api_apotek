import {validate} from "../validation/validation";
import {
    createUserValidation,
    currentUserValidation,
    loginValidation,
    searchUserValidation,
} from "../validation/user-validation";
import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";
import * as bcrypt from "bcrypt";
import {generateAccessToken} from "../application/jwt";
import {buildFilters} from "../helpers/filter-helper";
import {CreateUserRequest, LoginRequest, SearchUserRequest, toUserResponse, UserResponse} from "../model/user-model";
import {Pageable} from "../model/page-model";

const createUser = async (request: CreateUserRequest): Promise<UserResponse> => {
    request = validate(createUserValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            username: request.username,
        },
    });

    if (countUser > 0) {
        throw new ResponseError(400, "Username telah digunakan");
    }

    request.password = await bcrypt.hash(request.password, 10);

    const user = await prismaClient.user.create({
        data: request,
    });

    return toUserResponse(user)
};

const login = async (request: LoginRequest): Promise<UserResponse> => {
    request = validate(loginValidation, request);

    const user = await prismaClient.user.findUnique({
        where: {
            username: request.username,
        }
    });

    if (!user) {
        throw new ResponseError(401, "Username atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password);

    if (!isPasswordValid) {
        throw new ResponseError(401, "Username atau password salah");
    }

    const token = generateAccessToken(user);
    const response = toUserResponse(user)
    response.token = token;
    return response;
};

const getCurrentUser = async (id: number): Promise<UserResponse> => {
    id = validate(currentUserValidation, id);

    const user = await prismaClient.user.findUnique({
        where: {
            id: id,
        }
    });

    if (!user) {
        throw new ResponseError(404, "User tidak ditemukan");
    }

    return toUserResponse(user)
};

const searchUser = async (request: SearchUserRequest): Promise<Pageable<UserResponse>> => {
    request = validate(searchUserValidation, request);

    const skip = (request.page - 1) * request.size;

    const filterableFields = [
        {key: "username"},
        {key: "name"},
        {key: "role_id", exact: true},
    ];

    const filters = buildFilters(filterableFields, request);

    const users = await prismaClient.user.findMany({
        where: {
            AND: filters,
        },
        take: request.size,
        skip: skip,
    });

    const totalItems = await prismaClient.user.count({
        where: {
            AND: filters,
        },
    });

    return {
        data: users.map(user => toUserResponse(user)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size),
        },
    };
};

export default {
    createUser,
    login,
    getCurrentUser,
    searchUser,
};
