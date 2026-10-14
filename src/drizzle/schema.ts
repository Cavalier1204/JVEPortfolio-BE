import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  uniqueIndex,
  foreignKey,
  serial,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const subject = pgEnum("Subject", [
  "WERKPRAKTIJK_1",
  "WERKPRAKTIJK_2",
  "THEORIE",
  "SKILLS",
  "POSITIONERING",
  "PORTFOLIO",
]);

export const user = pgTable(
  "User",
  {
    id: uuid().primaryKey().defaultRandom(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    username: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 255 }).default("ADMIN").notNull(),
  },
  (table) => [
    uniqueIndex("User_username_key").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const media = pgTable(
  "Media",
  {
    id: uuid().primaryKey().defaultRandom(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    locationReference: text().notNull(),
    order: integer().notNull(),
    artPieceId: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.artPieceId],
      foreignColumns: [artPiece.id],
      name: "Media_artPieceId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const artPiece = pgTable("ArtPiece", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp({ precision: 3, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  year: integer().notNull(),
  module: integer().notNull(),
  subject: subject().notNull(),
});
