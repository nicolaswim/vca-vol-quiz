"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function ClientTheoryCourse({ chapter, theoryData }: { chapter: string, theoryData: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!theoryData || theoryData.length === 0) {
    return <div className="p-8 text-center text-slate-500">Geen theorie gevonden.</div>;
  }
  
  const currentSlide = theoryData[currentIndex];
  const isLast = currentIndex === theoryData.length - 1;

  const nextSlide = () => {
    if (currentIndex < theoryData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-sm font-medium text-slate-500">
        <Link href={`/course/${chapter}`} className="text-slate-400 hover:text-slate-600 font-medium inline-flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Stoppen
        </Link>
        <span>Slide {currentIndex + 1} van {theoryData.length}</span>
      </div>

      <div className="w-full max-w-md bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out" 
          style={{ width: `${((currentIndex + 1) / theoryData.length) * 100}%` }}
        />
      </div>

      <div className="relative w-full max-w-md flex-1 flex flex-col">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col mb-6">
          <h2 className="text-2xl font-bold text-slate-800 leading-snug mb-6">
            {currentSlide.title || "Theorie"}
          </h2>
          
          <div className="space-y-4 flex-1">
             {currentSlide.texts.map((t: string, i: number) => {
                if (['Introductie', 'Inleiding', 'Overzicht', 'Leerdoelen', 'Probeer opnieuw', 'Helaas', 'Toon juiste antwoord', '%_playerVars.sceneSlideNumber%', 'Ga verder', 'Hervatten', 'Startscherm', 'Warning'].includes(t)) return null;
                if (t.includes('%_player')) return null;
                
                // Emphasize bullet points or short sentences
                if (t.length < 50 && !t.includes('.')) {
                    return (
                        <div key={i} className="flex items-start">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-slate-700 font-medium">{t}</p>
                        </div>
                    );
                }
                
                return <p key={i} className="text-slate-600 leading-relaxed">{t}</p>
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full">
            <button 
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center transition"
            >
                <ChevronLeft size={20} className="mr-1" /> Vorige
            </button>
            
            {isLast ? (
                <Link href={`/course/${chapter}`} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-semibold hover:bg-green-700 flex items-center justify-center transition shadow-sm">
                    <CheckCircle2 size={20} className="mr-1.5" /> Afronden
                </Link>
            ) : (
                <button 
                    onClick={nextSlide}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 flex items-center justify-center transition shadow-sm"
                >
                    Volgende <ChevronRight size={20} className="ml-1" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
