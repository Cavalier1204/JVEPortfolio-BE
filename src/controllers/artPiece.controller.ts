import { Request, Response, NextFunction } from "express";
import {
  createArtPiece,
  updateArtPiece,
  deleteArtPiece,
  findArtPieceById,
  findArtPiecesByYearModule,
  findArtPiecesByYearModuleSubject,
  listPortfolioPieces,
} from "../services/artPiece.service";
import {
  CreateArtPieceInput,
  UpdateArtPieceInput,
  GetArtPiecesQuerySchema,
  GetArtPiecesSubjectQuerySchema,
} from "../types/artPiece.types";
import { z } from "zod";

type GetArtPiecesQuery = z.infer<typeof GetArtPiecesQuerySchema>;
type GetArtPiecesSubjectQuery = z.infer<typeof GetArtPiecesSubjectQuerySchema>;

export const createArtPieceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input: CreateArtPieceInput = req.body;
    const artPiece = await createArtPiece(input);
    return res.status(201).json({ data: artPiece });
  } catch (err) {
    next(err);
  }
};

export const updateArtPieceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const input: UpdateArtPieceInput = req.body;
    const updated = await updateArtPiece(id, input);
    return res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteArtPieceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await deleteArtPiece(id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getArtPieceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const artPiece = await findArtPieceById(id);
    return res.status(200).json({ data: artPiece });
  } catch (err) {
    next(err);
  }
};

export const getArtPiecesByYearModuleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (res.locals.query ?? req.query) as GetArtPiecesQuery;
    const { year, module: moduleNum } = query;
    const artPieces = await findArtPiecesByYearModule(
      Number(year),
      Number(moduleNum),
    );
    return res.status(200).json({ data: artPieces });
  } catch (err) {
    next(err);
  }
};

export const getArtPiecesByYearModuleSubjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (res.locals.query ?? req.query) as GetArtPiecesSubjectQuery;
    const { year, module: moduleNum, subject } = query;
    const artPieces = await findArtPiecesByYearModuleSubject(
      Number(year),
      Number(moduleNum),
      String(subject),
    );
    return res.status(200).json({ data: artPieces });
  } catch (err) {
    next(err);
  }
};

export const getPortfolioArtPiecesHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const portfolioPieces = await listPortfolioPieces();
    return res.status(200).json({ data: portfolioPieces });
  } catch (err) {
    next(err);
  }
};

export default {
  createArtPieceHandler,
  updateArtPieceHandler,
  deleteArtPieceHandler,
  getArtPieceHandler,
  getArtPiecesByYearModuleHandler,
  getArtPiecesByYearModuleSubjectHandler,
  getPortfolioArtPiecesHandler,
};
