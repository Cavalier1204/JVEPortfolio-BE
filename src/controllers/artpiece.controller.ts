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
import { CreateArtPieceInput } from "../types/artPiece.types";

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

export const updateArtPieceHandler = async (req, res) => {};

export const deleteArtPieceHandler = async (req, res) => {};

export const getArtPieceHandler = async (req, res) => {};

export const getArtPiecesByYearModuleHandler = async (req, res) => {};

export const getArtPiecesByYearModuleSubjectHandler = async (req, res) => {};

export const getPortfolioArtPiecesHandler = async (req, res) => {};

export default {
  createArtPieceHandler,
  updateArtPieceHandler,
  deleteArtPieceHandler,
  getArtPieceHandler,
  getArtPiecesByYearModuleHandler,
  getArtPiecesByYearModuleSubjectHandler,
  getPortfolioArtPiecesHandler,
};
