import { CustomError } from './custom-error';

class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export { BadRequestError };
