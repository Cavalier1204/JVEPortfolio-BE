import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { env } from "../config/env";
import {
  CreateArtPieceSchema,
  UpdateArtPieceSchema,
  GetArtPiecesQuerySchema,
  GetArtPiecesSubjectQuerySchema,
} from "../types/artPiece.types";
import { SigninSchema } from "../routers/user.router";
import { UpdateMediaSchema } from "../routers/media.router";
import { Subject } from "../types/enums/subject";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Security Scheme
export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your JWT token in the format: Bearer <token>",
  },
);

// Response & Shared Models defined via Zod
export const MediaResponseSchema = registry.register(
  "MediaItem",
  z.object({
    id: z.string().uuid(),
    locationReference: z.string(),
    order: z.number().int(),
    artPieceId: z.string().uuid(),
    createdAt: z.string(),
  }),
);

export const ArtPieceResponseSchema = registry.register(
  "ArtPiece",
  z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable().optional(),
    year: z.number().int().min(1).max(4),
    module: z.number().int().min(1).max(16),
    subject: z.enum(Subject),
    createdAt: z.string(),
    media: z.array(MediaResponseSchema).optional(),
  }),
);

export const HealthResponseSchema = registry.register(
  "HealthResponse",
  z.object({
    status: z.string(),
    message: z.string(),
  }),
);

export const SigninResponseSchema = registry.register(
  "SigninResponse",
  z.object({
    token: z.string(),
  }),
);

export const UserResponseSchema = registry.register(
  "UserResponse",
  z.object({
    id: z.string().uuid(),
    username: z.string(),
    role: z.string(),
  }),
);

export const LogoutResponseSchema = registry.register(
  "LogoutResponse",
  z.object({
    message: z.string(),
  }),
);

export const ErrorResponseSchema = registry.register(
  "ErrorResponse",
  z.object({
    error: z.string(),
  }),
);

// Paths - Derived directly from Zod validation schemas
registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Service health check",
  responses: {
    200: {
      description: "Server is healthy",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/user/signin",
  tags: ["Auth"],
  summary: "Sign in user, set signed HttpOnly auth cookie, and return user profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SigninSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful authentication",
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid input fields",
    },
    401: {
      description: "Unauthorized credentials",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: "Too many sign-in attempts",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/user/logout",
  tags: ["Auth"],
  summary: "Log out user and clear auth cookie",
  responses: {
    200: {
      description: "Successfully logged out",
      content: {
        "application/json": {
          schema: LogoutResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/user/me",
  tags: ["Auth"],
  summary: "Get current authenticated user info",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "Current user details",
      content: {
        "application/json": {
          schema: UserResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid token / cookie",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/artPiece",
  tags: ["ArtPiece"],
  summary: "Create a new art piece",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateArtPieceSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Art piece created successfully",
      content: {
        "application/json": {
          schema: z.object({
            data: ArtPieceResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation error or invalid year/module combination",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Missing or invalid token",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/artPiece/module",
  tags: ["ArtPiece"],
  summary: "Get art pieces by year and module",
  request: {
    query: GetArtPiecesQuerySchema,
  },
  responses: {
    200: {
      description: "List of art pieces matching query",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(ArtPieceResponseSchema),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/artPiece/subject",
  tags: ["ArtPiece"],
  summary: "Get art pieces by year, module, and subject category",
  request: {
    query: GetArtPiecesSubjectQuerySchema,
  },
  responses: {
    200: {
      description: "List of art pieces matching subject category",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(ArtPieceResponseSchema),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/artPiece/portfolio",
  tags: ["ArtPiece"],
  summary: "Get all portfolio showcase art pieces",
  responses: {
    200: {
      description: "List of portfolio art pieces",
      content: {
        "application/json": {
          schema: z.object({
            data: z.array(ArtPieceResponseSchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/artPiece/{id}",
  tags: ["ArtPiece"],
  summary: "Get an art piece by ID",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Art piece found",
      content: {
        "application/json": {
          schema: z.object({
            data: ArtPieceResponseSchema,
          }),
        },
      },
    },
    404: {
      description: "Art piece not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/artPiece/{id}",
  tags: ["ArtPiece"],
  summary: "Update an existing art piece",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateArtPieceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Art piece updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            data: ArtPieceResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Validation error or invalid year/module combination",
    },
    401: {
      description: "Missing or invalid token",
    },
    404: {
      description: "Art piece not found",
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/artPiece/{id}",
  tags: ["ArtPiece"],
  summary: "Delete an art piece and its associated media",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: "Art piece deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Missing or invalid token",
    },
    404: {
      description: "Art piece not found",
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/media/{artPieceId}",
  tags: ["Media"],
  summary: "Update media associated with an art piece",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({
      artPieceId: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMediaSchema,
        },
      },
    },
  },
  responses: {
    204: {
      description: "Media updated successfully",
    },
    400: {
      description: "Invalid media payload",
    },
    401: {
      description: "Missing or invalid token",
    },
  },
});

export const generateSwaggerDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "JVE Portfolio API",
      version: "1.2.0",
      description:
        "Backend REST API for the JVE Portfolio application. OpenAPI documentation auto-generated from Zod validation schemas.",
    },
    servers: [
      {
        url: "/",
        description: "Current environment",
      },
    ],
  });
};

export const swaggerDocument = generateSwaggerDocument();

export const setupSwagger = (app: Express) => {
  if (env.NODE_ENV !== "production") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.get("/docs.json", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.json(swaggerDocument);
    });
  }
};
