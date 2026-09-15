import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  const flashcardsPath = path.join(__dirname, 'final_flashcards.json')
  const theoryPath = path.join(__dirname, '../src/data/theory.json')
  
  const flashcards = JSON.parse(fs.readFileSync(flashcardsPath, 'utf8'))
  const theory = JSON.parse(fs.readFileSync(theoryPath, 'utf8'))
  
  await prisma.card.deleteMany({})
  await prisma.deck.deleteMany({})

  // Find all unique module_ids/chapters
  const allIds = new Set();
  
  // Hardcoded nice titles
  const metaInfo = {
    'a1': { title: 'A1: Module 1: Regelgeving en veiligheidsregels', description: 'Wetgeving en Arbeidsinspectie' },
    'a2': { title: 'A2: Module 2: Veilig werken, overleg en inspecties', description: 'Gevaren en risicobeheersing' },
    'a3': { title: 'A3: Module 3: Preventie', description: 'Wat te doen bij nood' },
    'a_vragen_1': { title: 'A4: Oefentoets deel A: Kennisvragen', description: 'Kennisvragen A1' },
    'a5_vragen_2': { title: 'A5: Oefentoets deel A: Toepassingsvragen', description: 'Kennisvragen A5' },
    'b1': { title: 'B1: Module 4: De werkplek', description: 'Borden en Markeringen' },
    'b2': { title: 'B2: Module 5: Persoonlijke beschermingsmiddelen', description: 'Veilige werkplek' },
    'b3': { title: 'B3: Module 6: Arbeidsmiddelen', description: 'PBMs' }
  }

  theory.forEach(t => {
      if (t.module_id) allIds.add(t.module_id);
  });
  flashcards.forEach(f => {
      let id = f.chapter;
      if (id.includes('a1')) id = 'a1';
      allIds.add(id);
  });
  
  // Create all decks
  for (const deckId of allIds) {
    const meta = metaInfo[deckId] || { title: `Module ${deckId}`, description: `Theorie en vragen voor ${deckId}` }
    const deck = await prisma.deck.create({
      data: {
        id: deckId,
        title: meta.title,
        description: meta.description
      }
    })
    console.log(`Created Deck: ${deck.title} (ID: ${deckId})`)
  }

  // Seed flashcards
  const chapters = {}
  for (const q of flashcards) {
    let id = q.chapter;
    if (id.includes('a1')) id = 'a1';
    if (!chapters[id]) chapters[id] = []
    chapters[id].push(q)
  }
  
  for (const [deckId, questions] of Object.entries(chapters)) {
    for (const q of questions) {
        let options = q.options;
        if (Array.isArray(options)) {
            options = JSON.stringify(options);
        }
        await prisma.card.create({
            data: {
                deckId: deckId,
                front: q.front,
                back: q.back,
                options: options,
                explanation: q.explanation,
                type: 'flashcard'
            }
        })
    }
    console.log(`  -> Added ${questions.length} cards to ${deckId}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
