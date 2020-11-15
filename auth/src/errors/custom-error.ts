abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor(message?: string) {
    // 'Error' breaks prototype chain here
    super(message);

    // restore prototype chain
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
  }
  abstract serializeErrors(): { message: string; field?: string }[];
}

export { CustomError };
