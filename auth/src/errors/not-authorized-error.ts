import { CustomError } from './custom-error';

class NotAuthorizedError extends CustomError {
  statusCode = 401;
  constructor() {
    super('Not authorized');
  }
  serializeErrors() {
    return [{ message: 'Not authorized' }];
  }
}

export { NotAuthorizedError };
