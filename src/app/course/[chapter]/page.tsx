import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const resolvedParams = await params;
  
  const theoryPath = path.join(process.cwd(), 'src', 'data', 'theory.json');
  let theoryData: any[] = [];
  try {
    const raw = fs.readFileSync(theoryPath, 'utf8');
    theoryData = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Filter to show all theory slides for now (we only have one chapter)
  
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/course" className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Terug naar overzicht
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mb-8 capitalize">{resolvedParams.chapter}</h1>
        
        <div className="space-y-8">
          {theoryData.map((slide, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{slide.title}</h2>
              <div className="space-y-2">
                {slide.texts.map((t: string, i: number) => {
                    // filter out navigation
                    if (['Introductie', 'Inleiding', 'Overzicht', 'Leerdoelen', 'Probeer opnieuw', 'Helaas', 'Toon juiste antwoord', '%_playerVars.sceneSlideNumber%', 'Ga verder', 'Hervatten', 'Startscherm', 'Warning'].includes(t)) return null;
                    if (t.includes('%_player')) return null;
                    return <p key={i} className="text-slate-600">{t}</p>
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
