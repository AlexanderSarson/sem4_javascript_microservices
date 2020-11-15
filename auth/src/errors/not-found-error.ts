import { CustomError } from './custom-error';

class NotFoundError extends CustomError {
  statusCode = 404;
  constructor(message?: string) {
    super('Route not found');
  }

  serializeErrors() {
    return [{ message: this.message || 'Not Found' }];
  }
}

export { NotFoundError };
