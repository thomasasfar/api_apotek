class ResponseError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ResponseError);
        }

        this.name = "ResponseError";
    }
}

export {ResponseError};
