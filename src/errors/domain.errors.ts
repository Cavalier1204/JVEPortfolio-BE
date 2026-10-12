export abstract class DomainError extends Error {
  abstract statusCode: number;

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidModuleError extends DomainError {
  statusCode = 400;
}

export class ArtPieceNotFoundError extends DomainError {
  statusCode = 404;
}

export class UnauthorizedError extends DomainError {
  statusCode = 401;
}

export class AdminAlreadyExistsError extends DomainError {
  statusCode = 409;
}

export class UserAlreadyExistsError extends AdminAlreadyExistsError {}
