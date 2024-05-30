import { Subject } from "@prisma/client";
import prisma from "../db";

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
      createdAt: "asc", // Sort from oldest to newest based on createdAt field
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
        createdAt: "asc", // Sort from oldest to newest based on createdAt field
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
        createdAt: "asc", // Sort from oldest to newest based on createdAt field
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
        createdAt: "asc", // Sort from oldest to newest based on createdAt field
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
    // Extract validated fields from the request body
    const { title, description, year, module, media, subject } = req.body;

    // Create the ArtPiece
    const createdArtPiece = await prisma.artPiece.create({
      data: {
        title,
        description,
        year,
        module,
        // Create associated Media objects
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
        media: true, // Include related media in the response
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
  const updated = await prisma.artPiece.update({
    where: {
      id: req.params.id,
    },
    data: req.body,
  });
  res.json({ data: updated });
};

// Delete artPiece
export const deleteArtPiece = async (req, res) => {
  try {
    // Start a transaction
    await prisma.$transaction([
      // Delete associated Media objects
      prisma.media.deleteMany({
        where: {
          artPieceId: req.params.id,
        },
      }),
      // Delete the ArtPiece itself
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
      createdAt: "asc", // Sort from oldest to newest based on createdAt field
    },
  });
  res.json({ data: portfolioPieces });
};
