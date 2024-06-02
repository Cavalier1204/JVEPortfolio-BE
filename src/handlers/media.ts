import prisma from "../db";

export const updateMedia = async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.media.deleteMany({
        where: {
          id: { in: req.body.deletedMedia },
        },
      }),
      prisma.media.createMany({
        data: req.body.newMedia.map((media) => ({
          locationReference: media.locationReference,
          order: media.order,
          artPieceId: req.params.artPieceId,
        })),
      }),
    ]);

    for (const mediaItem of req.body.updatedMedia) {
      // Perform individual update for each art piece
      await prisma.media.update({
        where: {
          id: mediaItem.id, // Specify the ID of the art piece
        },
        data: {
          order: mediaItem.order, // Set the new order value
        },
      });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Error updating media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
