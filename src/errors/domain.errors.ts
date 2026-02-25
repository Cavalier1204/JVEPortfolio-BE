export abstract class DomainError extends Error {
  abstract statusCode: number;
}

export class InvalidModuleError extends DomainError {
  statusCode = 400;
}

export class ArtPieceNotFoundError extends DomainError {
  statusCode = 404;
}
