export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function errorBody(code: string, message: string): ApiErrorBody {
  return {
    success: false,
    error: { code, message },
  };
}
