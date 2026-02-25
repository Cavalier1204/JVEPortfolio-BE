import { Subject } from "@prisma/client";
import prisma from "../config/prisma";
import validModules from "../data/year-structure.json";
import { CreateArtPieceInput } from "../types/artPiece.types";
import { InvalidModuleError } from "../errors/domain.errors";

export const createArtPiece = async (input: CreateArtPieceInput) => {
  const { title, description, year, module, media, subject } = input;
  if (!validModules[year]?.includes(module)) {
    throw new InvalidModuleError("Invalid module for the specified year");
  }

  return prisma.artPiece.create({
    data: {
      title,
      description,
      year,
      module,
      subject,
      media: {
        createMany: {
          data: media.map((m) => ({
            locationReference: m.locationReference,
            order: m.order,
          })),
        },
      },
    },
    include: {
      media: true,
    },
  });
};

export const updateArtPiece = async (req, res) => {
  try {
    const { year, module, ...rest } = req.body;

    if (!validModules[year as string]?.includes(module)) {
      return res
        .status(400)
        .json({ error: "Invalid module for the specified year" });
    }

    const dataToUpdate = {
      ...rest,
      ...(year !== undefined && { year: parseInt(year, 10) }),
      ...(module !== undefined && { module: parseInt(module, 10) }),
    };

    const updated = await prisma.artPiece.update({
      where: {
        id: req.params.id,
      },
      data: dataToUpdate,
    });
    res.json({ data: updated });
  } catch (error) {
    console.error("Error updating ArtPiece:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteArtPiece = async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.media.deleteMany({
        where: {
          artPieceId: req.params.id,
        },
      }),
      prisma.artPiece.delete({
        where: {
          id: req.params.id,
        },
      }),
    ]);

    res
      .json({
        message: "Art piece and associated media deleted successfully",
      })
      .status(204);
  } catch (error) {
    console.error("Error deleting art piece:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const findArtPieceById = async (req, res) => {
  try {
    const artPiece = await prisma.artPiece.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        media: true,
      },
    });

    if (!artPiece) {
      return res.status(404).json({ error: "Art piece not found" });
    }

    res.json({ data: artPiece });
  } catch (error) {
    console.error("Error fetching art piece:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const findArtPiecesByYearModule = async (year, module) => {
  return await prisma.artPiece.findMany({
    where: {
      year,
      module,
    },
    include: {
      media: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const findArtPiecesByYearModuleSubject = async (req, res) => {
  const subjectParam = req.query.subject;
  let artPieces = null;
  if (subjectParam === "werkpraktijk") {
    artPieces = await prisma.artPiece.findMany({
      where: {
        subject: { in: [Subject.WERKPRAKTIJK_1, Subject.WERKPRAKTIJK_2] },
        year: req.query.year,
        module: req.query.module,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } else if (subjectParam === "kennis") {
    artPieces = await prisma.artPiece.findMany({
      where: {
        subject: { in: [Subject.THEORIE, Subject.SKILLS] },
        year: req.query.year,
        module: req.query.module,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } else if (subjectParam === "positionering") {
    artPieces = await prisma.artPiece.findMany({
      where: {
        subject: Subject.POSITIONERING,
        year: req.query.year,
        module: req.query.module,
      },
      include: {
        media: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } else {
    return res.status(400).json({ error: "Invalid subject" });
  }
  res.json({ data: artPieces });
};

export const listPortfolioPieces = async (req, res) => {
  const portfolioPieces = await prisma.artPiece.findMany({
    where: {
      subject: "PORTFOLIO",
    },
    include: {
      media: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  res.json({ data: portfolioPieces });
};
