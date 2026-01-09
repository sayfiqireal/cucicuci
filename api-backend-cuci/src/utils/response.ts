export const successResponse = <T>(
  data: T,
  options?: { meta?: Record<string, unknown>; pagination?: Record<string, unknown> }
) => {
  return {
    success: true,
    data,
    ...(options?.pagination ? { pagination: options.pagination } : {}),
    ...(options?.meta ? { meta: options.meta } : {})
  };
};

export const errorResponse = (code: string, message: string, details?: unknown) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
};
