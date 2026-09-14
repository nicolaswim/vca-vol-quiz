import Link from 'next/link';

export default function CourseIndex() {
  const chapters = [
    { id: 'a1', title: 'Hoofdstuk 1: Arbowetgeving' },
    { id: 'a2', title: 'Hoofdstuk 2: Gevaren, risico\'s en preventie' },
    { id: 'a3', title: 'Hoofdstuk 3: Ongevallen en Noodsituaties' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6">Cursus VCA VOL</h1>
        
        <div className="space-y-4">
          {chapters.map((ch) => (
            <Link key={ch.id} href={`/course/${ch.id}`} className="block">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold text-slate-800">{ch.title}</h2>
                <p className="text-sm text-slate-500 mt-2">Lees de theorie over dit hoofdstuk</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
