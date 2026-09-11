import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stat = await prisma.globalStat.findUnique({
      where: { id: 'default' }
    });

    const totalMinutesSpent = stat?.totalMinutesSpent || 0;

    const hardestCardsProgress = await prisma.userProgress.findMany({
      orderBy: {
        timesWrong: 'desc'
      },
      take: 10,
      include: {
        card: true
      }
    });

    const hardestCards = hardestCardsProgress
      .filter(p => p.timesWrong > 0)
      .map(p => ({
        id: p.card.id,
        front: p.card.front,
        timesWrong: p.timesWrong,
        timesRight: p.timesRight
      }));

    const examResultsRaw = await prisma.examResult.findMany({
      include: { deck: true },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    const examResults = examResultsRaw.map(e => ({
      id: e.id,
      deckTitle: e.deck.title,
      score: e.score,
      totalCards: e.totalCards,
      createdAt: e.createdAt
    }));

    return NextResponse.json({ totalMinutesSpent, hardestCards, examResults });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sessionMinutes, examScore, examDeckId, totalCards } = await request.json();
    
    let updatedStat = null;
    if (typeof sessionMinutes === 'number') {
      updatedStat = await prisma.globalStat.upsert({
        where: { id: 'default' },
        update: {
          totalMinutesSpent: { increment: sessionMinutes }
        },
        create: {
          id: 'default',
          totalMinutesSpent: sessionMinutes
        }
      });
    }

    if (examScore !== undefined && examDeckId) {
      await prisma.examResult.create({
        data: {
          score: examScore,
          deckId: examDeckId,
          totalCards: totalCards || 0
        }
      });
    }

    return NextResponse.json({ success: true, stat: updatedStat });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
  }
}
