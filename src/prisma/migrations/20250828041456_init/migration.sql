-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nick" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Study" (
    "id" SERIAL NOT NULL,
    "nick" TEXT,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "img" TEXT,
    "password" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HabitHistory" (
    "id" SERIAL NOT NULL,
    "monDone" BOOLEAN NOT NULL DEFAULT false,
    "tueDone" BOOLEAN NOT NULL DEFAULT false,
    "wedDone" BOOLEAN NOT NULL DEFAULT false,
    "thuDone" BOOLEAN NOT NULL DEFAULT false,
    "friDone" BOOLEAN NOT NULL DEFAULT false,
    "satDone" BOOLEAN NOT NULL DEFAULT false,
    "sunDone" BOOLEAN NOT NULL DEFAULT false,
    "weekDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyId" INTEGER NOT NULL,

    CONSTRAINT "HabitHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Habit" (
    "id" SERIAL NOT NULL,
    "habit" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "habitHistoryId" INTEGER NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Focus" (
    "id" SERIAL NOT NULL,
    "setTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyId" INTEGER NOT NULL,

    CONSTRAINT "Focus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Point" (
    "id" SERIAL NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyId" INTEGER NOT NULL,

    CONSTRAINT "Point_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Emoji" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emoji_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudyEmoji" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyId" INTEGER NOT NULL,
    "emojiId" INTEGER NOT NULL,

    CONSTRAINT "StudyEmoji_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "HabitHistory_weekDate_idx" ON "public"."HabitHistory"("weekDate");

-- CreateIndex
CREATE UNIQUE INDEX "HabitHistory_studyId_weekDate_key" ON "public"."HabitHistory"("studyId", "weekDate");

-- CreateIndex
CREATE UNIQUE INDEX "Habit_habitHistoryId_date_habit_key" ON "public"."Habit"("habitHistoryId", "date", "habit");

-- CreateIndex
CREATE UNIQUE INDEX "Emoji_symbol_key" ON "public"."Emoji"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "StudyEmoji_studyId_emojiId_key" ON "public"."StudyEmoji"("studyId", "emojiId");

-- AddForeignKey
ALTER TABLE "public"."HabitHistory" ADD CONSTRAINT "HabitHistory_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Habit" ADD CONSTRAINT "Habit_habitHistoryId_fkey" FOREIGN KEY ("habitHistoryId") REFERENCES "public"."HabitHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Focus" ADD CONSTRAINT "Focus_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Point" ADD CONSTRAINT "Point_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyEmoji" ADD CONSTRAINT "StudyEmoji_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "public"."Study"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudyEmoji" ADD CONSTRAINT "StudyEmoji_emojiId_fkey" FOREIGN KEY ("emojiId") REFERENCES "public"."Emoji"("id") ON DELETE CASCADE ON UPDATE CASCADE;
