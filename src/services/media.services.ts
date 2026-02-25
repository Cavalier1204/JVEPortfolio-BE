import prisma from "../config/prisma";

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
      await prisma.media.update({
        where: {
          id: mediaItem.id,
        },
        data: {
          order: mediaItem.order,
        },
      });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Error updating media:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
