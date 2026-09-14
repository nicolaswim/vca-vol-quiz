import fs from 'fs';
import path from 'path';
import ClientTheoryCourse from './ClientTheoryCourse';

export default async function TheoryPage({ params }: { params: Promise<{ chapter: string }> }) {
  const resolvedParams = await params;
  
  const theoryPath = path.join(process.cwd(), 'src', 'data', 'theory.json');
  let theoryData: any[] = [];
  try {
    const raw = fs.readFileSync(theoryPath, 'utf8');
    theoryData = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  
  return <ClientTheoryCourse chapter={resolvedParams.chapter} theoryData={theoryData} />;
}
