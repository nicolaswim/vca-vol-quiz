import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const decks = await prisma.deck.findMany({
    include: {
      _count: {
        select: { cards: true }
      }
    }
  });

  // Sort decks alphabetically by id (a1, a2, a3, a4, a5, b1, b2, b3)
  decks.sort((a, b) => a.id.localeCompare(b.id));

  return NextResponse.json({ decks });
}
