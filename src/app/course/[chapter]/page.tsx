import Link from 'next/link';
import { BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function ChapterHub({ params }: { params: Promise<{ chapter: string }> }) {
  const resolvedParams = await params;
  
  let displayTitle = resolvedParams.chapter;
  try {
      const deck = await prisma.deck.findUnique({
          where: { id: resolvedParams.chapter }
      });
      if (deck) {
          displayTitle = deck.title;
      }
  } catch(e) {
      console.error(e);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <Link href="/course" className="text-blue-600 hover:underline mb-6 inline-flex items-center text-sm font-medium">
          <ArrowLeft size={16} className="mr-1" /> Terug naar overzicht
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{displayTitle}</h1>
        <p className="text-slate-500 mb-8">Kies of je de theorie wilt bestuderen of direct de vragen wilt oefenen.</p>
        
        <div className="space-y-4">
          <Link href={`/course/${resolvedParams.chapter}/theory`} className="w-full flex items-center p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-200 hover:shadow-md transition shadow-sm group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mr-5 text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl mb-1">Theorie Leren</h2>
              <p className="text-sm text-slate-500">Interactieve zelfstudie cursus</p>
            </div>
          </Link>

          <Link href={`/?deck=${resolvedParams.chapter}`} className="w-full flex items-center p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-md transition shadow-sm group">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mr-5 text-indigo-600 group-hover:scale-110 transition-transform">
              <HelpCircle size={28} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-xl mb-1">Vragen Oefenen</h2>
              <p className="text-sm text-slate-500">Oefen met flashcards voor dit onderdeel</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
