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

  // Sort decks: Chapters 1 to 6 first, then Proefexamen
  const order: Record<string, number> = {
    'Arbowet': 1,
    'Gevaren': 2,
    'Personen': 3,
    'Materiaal': 4,
    'Veilig werken': 5,
    'Elektrotechniek': 6,
    'AI Sparkle Questions': 7,
    'Proefexamen': 8,
    'Proefexamen 1': 9,
    'Proefexamen 2': 10,
    'Proefexamen 3': 11,
    'Proefexamen 4': 12,
    'Proefexamen 5': 13,
  };

  decks.sort((a, b) => {
    const orderA = order[a.title] ?? 99;
    const orderB = order[b.title] ?? 99;
    return orderA - orderB;
  });

  return NextResponse.json({ decks });
}
