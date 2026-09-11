import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Leitner system intervals in days
const INTERVALS = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export async function POST(request: Request) {
  try {
    const { cardId, isCorrect } = await request.json();

    if (!cardId || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Find existing progress
    let progress = await prisma.userProgress.findUnique({
      where: { cardId: cardId },
    });

    let newBox = 0;
    if (progress) {
      if (isCorrect) {
        newBox = Math.min(progress.box + 1, 5); // Max box is 5
      } else {
        newBox = 0; // Demote to box 0 on failure so it's due immediately
      }
    } else {
      if (isCorrect) {
        newBox = 1; // Start at box 1 (1 day) if correct on first try
      } else {
        newBox = 0;
      }
    }

    // Calculate next review date
    const daysToAdd = INTERVALS[newBox as keyof typeof INTERVALS] || 0;
    const nextReviewDate = new Date();
    if (daysToAdd > 0) {
      nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
    }

    // Upsert the progress
    const updatedProgress = await prisma.userProgress.upsert({
      where: { cardId: cardId },
      update: {
        box: newBox,
        nextReviewDate: nextReviewDate,
        timesRight: isCorrect ? { increment: 1 } : undefined,
        timesWrong: !isCorrect ? { increment: 1 } : undefined,
      },
      create: {
        cardId: cardId,
        box: newBox,
        nextReviewDate: nextReviewDate,
        timesRight: isCorrect ? 1 : 0,
        timesWrong: !isCorrect ? 1 : 0,
      },
    });

    return NextResponse.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error("Error processing review:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
