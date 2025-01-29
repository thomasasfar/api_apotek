import {Schema} from "joi";
import {ResponseError} from "../error/response-error";

type RequestData = Record<string, any> | any;

const validate = <T>(schema: Schema, request: RequestData): T => {
    const result = schema.validate(request, {
        abortEarly: false,
        allowUnknown: false,
    });

    if (result.error) {
        throw new ResponseError(400, result.error.message);
    } else {
        return result.value as T;
    }
};

export {
    validate
};
