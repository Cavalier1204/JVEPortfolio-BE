import prisma from "../db";

// Get all
export const getArtPiecesByYearByModule = async (req, res) => {
  const artPieces = await prisma.artPiece.findMany({
    where: req.query,
    include: {
      media: true,
    },
    orderBy: {
      createdAt: "asc", // Sort from oldest to newest based on createdAt field
    },
  });
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

// Create product
export const saveArtPiece = async (req, res) => {
  try {
    // Extract validated fields from the request body
    const { title, description, year, module, media } = req.body;

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

// Update product
// export const updateArtPiece = async (req, res) => {
//   const updated = await prisma.product.update({
//     where: {
//       id_belongsToId: {
//         id: req.params.id,
//         belongsToId: req.user.id,
//       },
//     },
//     data: {
//       name: req.body.name,
//     },
//   });
//   res.json({ data: updated });
// };

// Delete product
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
