import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  const rawDataPath = path.join(__dirname, 'final_flashcards.json')
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'))
  
  await prisma.card.deleteMany({})
  await prisma.deck.deleteMany({})

  const chapters = {}
  for (const q of rawData) {
    if (!chapters[q.chapter]) {
      chapters[q.chapter] = []
    }
    chapters[q.chapter].push(q)
  }
  
  // Hardcoded decks that have theory but maybe no flashcards
  const allDecks = {
    'a1': { title: 'Arbowetgeving', description: 'Wetgeving en Arbeidsinspectie' },
    'a2': { title: 'Gevaren, risico\'s en preventie', description: 'Gevaren en risicobeheersing' },
    'a3': { title: 'Ongevallen en Noodsituaties', description: 'Wat te doen bij nood' },
    'a_vragen_1': { title: 'Oefentoets A1', description: 'Kennisvragen A1' }
  }
  
  for (const [deckId, meta] of Object.entries(allDecks)) {
    const deck = await prisma.deck.create({
      data: {
        id: deckId, // Force ID to match module_id!
        title: meta.title,
        description: meta.description
      }
    })
    console.log(`Created Deck: ${deck.title} (ID: ${deckId})`)
  }

  // Now seed questions
  for (const [chapterFile, questions] of Object.entries(chapters)) {
    let targetDeckId = chapterFile;
    if (chapterFile.includes("a1")) targetDeckId = "a1";
    if (chapterFile.includes("a2")) targetDeckId = "a2";
    if (chapterFile.includes("a3")) targetDeckId = "a3";
    
    // Check if deck exists, otherwise create it dynamically
    let deck = await prisma.deck.findUnique({ where: { id: targetDeckId } })
    if (!deck) {
        deck = await prisma.deck.create({
          data: {
            id: targetDeckId,
            title: targetDeckId,
            description: `Questions for ${targetDeckId}`
          }
        })
    }
    
    for (const q of questions) {
        let options = q.options;
        if (Array.isArray(options)) {
            options = JSON.stringify(options);
        }
        
        await prisma.card.create({
            data: {
                deckId: deck.id,
                front: q.front,
                back: q.back,
                options: options,
                explanation: q.explanation,
                type: 'flashcard'
            }
        })
    }
    console.log(`  -> Added ${questions.length} cards to ${deck.title}`)
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
