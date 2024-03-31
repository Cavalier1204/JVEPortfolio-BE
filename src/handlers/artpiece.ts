import prisma from "../db";

// Get all
export const getArtPieces = async (req, res) => {
  //   const user = await prisma.user.findUnique({
  //     where: {
  //       id: req.user.id,
  //     },
  //     include: {
  //       products: true,
  //     },
  //   });
  //   res.json({ data: user.products });
};

// Get one
export const getOneArtPiece = async (req, res) => {
  //   const product = await prisma.product.findFirst({
  //     where: {
  //       id: req.params.id,
  //       belongsToId: req.user.id,
  //     },
  //   });
  //   res.json({ data: product });
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
            data: media.map((m, index) => ({
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
export const updateArtPiece = async (req, res) => {
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
};

// Delete product
export const deleteArtPiece = async (req, res) => {
  //   const deleted = await prisma.product.delete({
  //     where: {
  //       id_belongsToId: {
  //         id: req.params.id,
  //         belongsToId: req.user.id,
  //       },
  //     },
  //   });
  //   res.json({ data: deleted });
};
