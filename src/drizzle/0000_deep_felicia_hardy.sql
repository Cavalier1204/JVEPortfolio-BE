-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."Subject" AS ENUM('WERKPRAKTIJK_1', 'WERKPRAKTIJK_2', 'THEORIE', 'SKILLS', 'POSITIONERING', 'PORTFOLIO');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Media" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"locationReference" text NOT NULL,
	"order" integer NOT NULL,
	"artPieceId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ArtPiece" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"year" integer NOT NULL,
	"module" integer NOT NULL,
	"subject" "Subject" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Media" ADD CONSTRAINT "Media_artPieceId_fkey" FOREIGN KEY ("artPieceId") REFERENCES "public"."ArtPiece"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "User_username_key" ON "User" USING btree ("username" text_ops);
*/