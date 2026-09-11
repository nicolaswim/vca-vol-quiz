import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Card, Deck, Prisma } from '@prisma/client';

type CardWithDeck = Card & { deck: Deck };

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');
    const limitParam = searchParams.get('limit');

    const now = new Date();

    const isMixedAi = deckId === 'mixed_ai';
    const isMixedClassic = deckId === 'mixed';
    const isSpecificDeck = deckId && !isMixedAi && !isMixedClassic;

    let isExamDeck = false;
    if (isSpecificDeck) {
      const deck = await prisma.deck.findUnique({ where: { id: deckId } });
      if (deck && deck.title.toLowerCase().includes('proef')) {
        isExamDeck = true;
      }
    }

    const cardFilter: Prisma.CardWhereInput = {};
    if (isMixedAi) {
      // Fetch both 'flashcard' and 'ai' by applying no type filter
    } else if (isMixedClassic) {
      cardFilter.type = 'flashcard'; // Classic course material only
    } else if (isSpecificDeck) {
      cardFilter.deckId = deckId;
    }

    if (isExamDeck) {
      // For exams, just fetch all cards, ignore SRS due dates and limits
      const allCards = await prisma.card.findMany({
        where: cardFilter,
        include: { deck: true }
      });
      // Optionally shuffle exam questions
      allCards.sort(() => Math.random() - 0.5);
      return NextResponse.json({ cards: allCards, isExam: true });
    }

    const dueProgress = await prisma.userProgress.findMany({
      where: {
        nextReviewDate: {
          lte: now,
        },
        card: cardFilter,
      },
      include: {
        card: {
          include: { deck: true }
        },
      },
      take: 100, // Fetch more to shuffle
    });

    let dueCards: CardWithDeck[] = dueProgress.map((p) => p.card);
    dueCards.sort(() => Math.random() - 0.5);
    
    const maxQuestions = limitParam ? parseInt(limitParam) : (isSpecificDeck ? 35 : 6);
    dueCards = dueCards.slice(0, maxQuestions);

    let newCards: CardWithDeck[] = [];
    
    if (dueCards.length < maxQuestions) {
      const allNewCards = await prisma.card.findMany({
        where: {
          progress: {
            none: {}
          },
          ...cardFilter
        },
        include: { deck: true }
      });
      
      allNewCards.sort(() => Math.random() - 0.5);
      newCards = allNewCards.slice(0, maxQuestions - dueCards.length);
    }

    const sessionCards = [...dueCards, ...newCards];
    sessionCards.sort(() => Math.random() - 0.5);

    return NextResponse.json({ cards: sessionCards });
  } catch (error: unknown) {
    console.error("Error fetching due cards:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to fetch due cards", 
      details: message
    }, { status: 500 });
  }
}
