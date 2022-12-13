export interface IServiceResult<TData> {
    status: number;
    data?: TData;
    errorMessage?: IError;
}

export interface IError {
    code: string;
    errorMessages: string[];
}