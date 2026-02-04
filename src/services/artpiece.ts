import { Subject } from "@prisma/client";
import prisma from "../config/prisma";
import validModules from "../data/year-structure.json";

// Get by year by module
export const getArtPiecesByYearByModule = async (req, res) => {
  const artPieces = await prisma.artPiece.findMany({
    where: {
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
  res.json({ data: artPieces });
};

// Get by year by module by subject
export const getArtPiecesByYearByModuleBySubject = async (req, res) => {
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

// Get one
export const getOneArtPiece = async (req, res) => {
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

// Create artPiece
export const saveArtPiece = async (req, res) => {
  try {
    const { title, description, year, module, media, subject } = req.body;

    if (!validModules[year as string]?.includes(module)) {
      return res
        .status(400)
        .json({ error: "Invalid module for the specified year" });
    }

    const createdArtPiece = await prisma.artPiece.create({
      data: {
        title,
        description,
        year,
        module,
        media: {
          createMany: {
            data: media.map((m) => ({
              locationReference: m.locationReference,
              order: m.order,
            })),
          },
        },
        subject,
      },
      include: {
        media: true,
      },
    });

    res.status(201).json({ data: createdArtPiece });
  } catch (error) {
    console.error("Error creating ArtPiece:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update artPiece
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

// Delete artPiece
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

// Get portfolio items
export const getPortfolioPieces = async (req, res) => {
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
