"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Brain, Check, X, BookOpen, Layers, BarChart, ArrowLeft, ChevronRight, Award } from "lucide-react";

type Deck = {
  id: string;
  title: string;
  description: string | null;
  _count?: { cards: number };
};

type Card = {
  id: string;
  front: string;
  back: string;
  options: string | null;
  explanation: string | null;
  type?: string;
  deck: Deck;
};

type StatsData = {
  examResults?: Array<{
    id: string;
    deckTitle: string;
    score: number;
    totalCards: number;
    createdAt: string;
  }>;
  totalMinutesSpent?: number;
  hardestCards?: Array<{
    id: string;
    timesWrong: number;
    front: string;
  }>;
};

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // App States: 'menu' | 'chapters' | 'loading' | 'session' | 'done' | 'stats'
  const [appState, setAppState] = useState<'menu' | 'chapters' | 'loading' | 'session' | 'done' | 'stats'>('menu');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [isExamSession, setIsExamSession] = useState(false);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const deckParam = urlParams.get('deck');
      if (deckParam && decks.length > 0) {
        const deckToStart = decks.find(d => d.title.toLowerCase().includes(deckParam.toLowerCase()) || d.id === deckParam);
        if (deckToStart) {
          window.history.replaceState({}, document.title, window.location.pathname);
          startSession(deckToStart.id);
        }
      }
    }
  }, [decks]);

  useEffect(() => {
    fetch('/api/decks')
      .then(res => res.json())
      .then(data => {
        if (data.decks) setDecks(data.decks);
      })
      .catch(() => {});
  }, []);

  const finishSession = () => {
    if (sessionStartTime) {
      const minutes = (Date.now() - sessionStartTime) / 60000;
      const payload: any = { sessionMinutes: minutes };
      
      if (isExamSession && currentDeckId) {
        payload.examScore = Math.round((sessionScore / cards.length) * 100);
        payload.examDeckId = currentDeckId;
        payload.totalCards = cards.length;
      }
      
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
    setSessionStartTime(null);
    setAppState('done');
  };

  const openStats = async () => {
    setAppState('loading');
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStatsData(data);
      setAppState('stats');
    } catch {
      alert("Fout bij het laden van statistieken.");
      setAppState('menu');
    }
  };

  const startSession = async (deckId: string) => {
    setAppState('loading');
    setCurrentDeckId(deckId);
    try {
      const res = await fetch(`/api/cards/due?deckId=${deckId}`);
      const data = await res.json();
      if (data.error || !data.cards) {
        alert(data.error || "Kon vragen niet laden.");
        setAppState('menu');
        return;
      }
      setCards(data.cards);
      setCurrentIndex(0);
      setShowAnswer(false);
      setSelectedOption(null);
      setSessionScore(0);
      setIsExamSession(!!data.isExam);
      if (data.cards.length > 0) {
        setSessionStartTime(Date.now());
        setAppState('session');
      } else {
        setAppState('done');
      }
    } catch {
      alert("Netwerkfout bij het ophalen van vragen.");
      setAppState('menu');
    }
  };

  const handleReview = async (isCorrect: boolean) => {
    if (isCorrect) setSessionScore(prev => prev + 1);
    const currentCard = cards[currentIndex];
    
    // Optimistic UI update
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    } else {
      finishSession();
    }

    // Fire & forget review API call
    fetch('/api/cards/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: currentCard.id,
        isCorrect
      })
    }).catch(() => {});
  };

  // 1. MAIN MENU: Exactly 4 Main Buttons (AI, Classic Quiz, Chapters & Proefexamen, Stats)
  if (appState === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Brain size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-1">VCA VOL</h1>
          <p className="text-center text-slate-500 mb-8 text-sm">Bite-Sized Veiligheidsexamen Trainer</p>
          
          <div className="space-y-3">
            {/* 1. AI Spark Challenge */}
            <button
              onClick={() => startSession('mixed_ai')}
              className="w-full p-4 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition flex items-center shadow-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mr-3.5 relative z-10 flex-shrink-0">
                <Brain className="text-white" size={22} />
              </div>
              <div className="text-left relative z-10 flex-1">
                <div className="font-semibold text-base leading-tight">AI Enhanced Mix</div>
                <div className="text-xs text-indigo-200 mt-0.5">Normale vragen + AI scenario&apos;s</div>
              </div>
              <ChevronRight size={18} className="text-indigo-300 relative z-10" />
            </button>

            {/* 2. Classic Quiz (Mixed Course Material) */}
            <button
              onClick={() => startSession('mixed')}
              className="w-full p-4 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition flex items-center shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mr-3.5 flex-shrink-0">
                <Layers className="text-white" size={22} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base leading-tight">Classic Quiz (Gemixt)</div>
                <div className="text-xs text-blue-200 mt-0.5">Snelle mix uit alle hoofdstukken</div>
              </div>
              <ChevronRight size={18} className="text-blue-300" />
            </button>

            
            {/* 2.5 Theorie Cursus */}
            <Link
              href="/course"
              className="w-full p-4 rounded-2xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition flex items-center shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mr-3.5 flex-shrink-0">
                <BookOpen className="text-white" size={22} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base leading-tight">Theorie (Cursus)</div>
                <div className="text-xs text-teal-100 mt-0.5">Lees de lesstof per hoofdstuk</div>
              </div>
              <ChevronRight size={18} className="text-teal-300" />
            </Link>

            {/* 3. Hoofdstukken & Proefexamen (Dedicated Sub-Menu!) */}
            <button
              onClick={() => setAppState('chapters')}
              className="w-full p-4 rounded-2xl bg-purple-700 text-white font-medium hover:bg-purple-800 transition flex items-center shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mr-3.5 flex-shrink-0">
                <BookOpen className="text-white" size={22} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base leading-tight">Hoofdstukken & Proefexamen</div>
                <div className="text-xs text-purple-200 mt-0.5">Oefen per hoofdstuk of doe het proefexamen</div>
              </div>
              <ChevronRight size={18} className="text-purple-300" />
            </button>

            {/* 4. Your Stats & Progress */}
            <button
              onClick={openStats}
              className="w-full p-4 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition flex items-center shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mr-3.5 flex-shrink-0">
                <BarChart className="text-white" size={22} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-base leading-tight">Voortgang & Statistieken</div>
                <div className="text-xs text-emerald-200 mt-0.5">Bekijk leertijd en gemiste kaarten</div>
              </div>
              <ChevronRight size={18} className="text-emerald-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHAPTERS & PROEFEXAMEN SUB-VIEW
  if (appState === 'chapters') {
    const proefDecks = decks.filter(d => d.title.toLowerCase().includes('proef'));
    const chapterDecks = decks.filter(d => !d.title.toLowerCase().includes('proef'));

    const chapterMeta: Record<string, { num: string; subtitle: string }> = {
      'Arbowet': { num: '1', subtitle: 'Wet- en regelgeving & RI&E' },
      'Gevaren': { num: '2', subtitle: 'Gevaren van elektriciteit' },
      'Personen': { num: '3', subtitle: 'Aanwijzingen (IV, WV, VP, VOP)' },
      'Materiaal': { num: '4', subtitle: 'PBM, gereedschap & meters' },
      'Veilig werken': { num: '5', subtitle: '5 stappen spanningsloos werken' },
      'Elektrotechniek': { num: '6', subtitle: 'Beveiligingen, stelsels & leidingen' },
      'AI Sparkle Questions': { num: '★', subtitle: 'Praktijkgerichte scenario\'s met AI' },
    };

    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center py-8 font-sans">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100">
          {/* Header navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setAppState('menu')}
              className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={18} className="mr-1.5" />
              Hoofdmenu
            </button>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              VCA VOL
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Kies Onderdeel</h2>
          <p className="text-sm text-slate-500 mb-6">
            Kies een specifiek hoofdstuk of test jezelf direct met een van de officiële proefexamens.
          </p>

          {/* Featured: Proefexamens */}
          {proefDecks.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
                Proefexamens
              </p>
              {proefDecks.map((proefDeck) => (
                <button
                  key={proefDeck.id}
                  onClick={() => startSession(proefDeck.id)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md hover:shadow-lg transition text-left relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Award size={18} className="text-white" />
                    </div>
                    <span className="bg-amber-900/40 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {proefDeck._count?.cards || 0} Vragen
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {proefDeck.title}
                  </h3>
                  <div className="flex items-center text-xs font-bold text-amber-100 group-hover:text-white transition-colors">
                    Start {proefDeck.title.includes('Hans') ? 'Examen' : 'Proefexamen'} <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chapters List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Lesstof per Hoofdstuk
              </p>
              <span className="text-xs text-slate-400 font-medium">
                {chapterDecks.length} hoofdstukken
              </span>
            </div>

            <div className="space-y-2.5">
              {chapterDecks.map(deck => {
                const meta = chapterMeta[deck.title];
                const cardCount = deck._count?.cards;
                return (
                  <button
                    key={deck.id}
                    onClick={() => startSession(deck.id)}
                    className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition flex-shrink-0 shadow-2xs">
                        {meta?.num || '•'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-900 truncate">
                          {meta ? `H${meta.num}: ` : ''}{deck.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {meta?.subtitle || deck.description || 'Hoofdstuk oefeningen'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      {cardCount !== undefined && (
                        <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {cardCount} vr.
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. LOADING STATE
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Vragen laden...</p>
      </div>
    );
  }

  // 4. STATS VIEW
  if (appState === 'stats') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center py-12 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Jouw Voortgang</h2>
            <button onClick={() => setAppState('menu')} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <p className="text-emerald-800 text-sm font-medium mb-1">Totale Leertijd</p>
              <p className="text-4xl font-bold text-emerald-600">
                {Math.round(statsData?.totalMinutesSpent || 0)} <span className="text-lg">min</span>
              </p>
            </div>
          </div>

          {statsData?.examResults && statsData.examResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Award size={20} className="mr-2 text-amber-500" /> Examen Resultaten
              </h3>
              <div className="space-y-3">
                {statsData.examResults.map((e) => (
                  <div key={e.id} className="p-4 rounded-xl border border-amber-100 bg-amber-50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{e.deckTitle}</p>
                      <p className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="bg-amber-500 text-white font-black px-3 py-1.5 rounded-lg text-lg shadow-sm">
                      {e.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Moeilijkste Vragen</h3>
            <div className="space-y-3">
              {statsData?.hardestCards && statsData.hardestCards.length > 0 ? (
                statsData.hardestCards.map((card) => (
                  <div key={card.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start">
                    <div className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-lg text-xs mr-3 flex-shrink-0">
                      {card.timesWrong}x Fout
                    </div>
                    <p className="text-sm text-slate-700 font-medium line-clamp-2">{card.front}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">Je hebt nog geen vragen gemist. Goed bezig!</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setAppState('menu')}
            className="w-full mt-8 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition"
          >
            Terug naar Menu
          </button>
        </div>
      </div>
    );
  }

  // 5. SESSION COMPLETE
  if (appState === 'done') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sessie Voltooid!</h2>
        {isExamSession ? (
          <div className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-200 text-center w-full max-w-xs shadow-sm">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Jouw Score</p>
            <div className="text-5xl font-black text-amber-600 mb-2">{Math.round((sessionScore / cards.length) * 100)}%</div>
            <p className="text-sm text-amber-700 font-medium">Je had {sessionScore} van de {cards.length} vragen goed.</p>
          </div>
        ) : (
          <p className="text-slate-500 mb-8 text-center max-w-sm text-sm leading-relaxed">
            Je hebt alle vragen voor deze ronde doorgenomen. Blijf herhalen voor maximaal resultaat op je examen!
          </p>
        )}
        <button 
          onClick={() => setAppState('menu')}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-sm hover:bg-blue-700 transition"
        >
          Terug naar Menu
        </button>
      </div>
    );
  }

  // 6. FLASHCARD SESSION
  const currentCard = cards[currentIndex];
  let parsedOptions: string[] = [];
  try {
    if (currentCard.options) {
      parsedOptions = JSON.parse(currentCard.options);
    }
  } catch {}

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-sm font-medium text-slate-500">
        <button onClick={finishSession} className="text-slate-400 hover:text-slate-600 font-medium">
          Stoppen
        </button>
        <span>Vraag {currentIndex + 1} van {cards.length}</span>
        <span className="text-blue-600 truncate max-w-[130px] font-semibold">{currentCard.deck?.title}</span>
      </div>

      <div className="w-full max-w-md bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out" 
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      <div className="relative w-full max-w-md flex-1 flex flex-col">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col">
          {(() => {
            let frontText = currentCard.front;
            let frontImage = null;
            if (frontText.includes("[IMG:")) {
              const start = frontText.indexOf("[IMG:");
              const end = frontText.indexOf("]", start);
              if (end !== -1) {
                frontImage = frontText.substring(start + 5, end);
                frontText = frontText.substring(0, start) + frontText.substring(end + 1);
              }
            }

            return (
              <>
                {currentCard.type === 'ai' && (
                  <div className="mb-4 inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit">
                    <Brain size={14} /> AI Spark Question
                  </div>
                )}
                {frontImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frontImage} alt="Visual for question" className="w-full h-auto object-contain max-h-48" />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug mb-8">
                  {frontText.trim()}
                </h2>
              </>
            );
          })()}

          {!showAnswer ? (
            <div className="flex-1 flex flex-col gap-3 justify-center">
              {parsedOptions.length > 0 ? (
                parsedOptions.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSelectedOption(opt);
                      setShowAnswer(true);
                    }}
                    className="p-4 rounded-2xl border-2 border-slate-100 text-left text-slate-700 font-medium hover:border-blue-200 hover:bg-blue-50 transition"
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-medium hover:bg-slate-200 mt-auto"
                >
                  Toon Antwoord
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
              {selectedOption && (
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium mb-1">Jouw keuze:</p>
                  <p className="text-slate-700 font-medium">{selectedOption}</p>
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-sm text-blue-600 font-bold tracking-wider uppercase mb-2">Juiste Antwoord</p>
                <p className="text-lg text-slate-800 font-semibold">{currentCard.back}</p>
              </div>

              {currentCard.explanation && currentCard.explanation !== "null" && (() => {
                let explText = currentCard.explanation;
                let explImage = null;
                if (explText.includes("[IMG:")) {
                  const start = explText.indexOf("[IMG:");
                  const end = explText.indexOf("]", start);
                  if (end !== -1) {
                    explImage = explText.substring(start + 5, end);
                    explText = explText.substring(0, start) + explText.substring(end + 1);
                  }
                }
                return (
                  <div className="mb-8 bg-blue-50/50 p-4 rounded-2xl">
                    {explImage && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={explImage} alt="Visual explanation" className="w-full h-auto object-contain max-h-48" />
                      </div>
                    )}
                    {explText.trim() && (
                      <p className="text-sm text-slate-600 leading-relaxed">{explText.trim()}</p>
                    )}
                  </div>
                );
              })()}

              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-center text-sm font-medium text-slate-400 mb-4">Had je het goed?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleReview(false)}
                    className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition"
                  >
                    <X size={24} className="mb-1" />
                    <span className="font-bold">Fout</span>
                  </button>
                  <button 
                    onClick={() => handleReview(true)}
                    className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition"
                  >
                    <Check size={24} className="mb-1" />
                    <span className="font-bold">Goed</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
