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
  
  for (const [chapterFile, questions] of Object.entries(chapters)) {
    // "a1.plusport.com.har" -> "A1 Plusport Com" or we just hardcode "Arbowetgeving"
    let title = chapterFile;
    if (title.includes("a1")) title = "Arbowetgeving";
    
    const deck = await prisma.deck.create({
      data: {
        title: title,
        description: `Questions extracted from ${chapterFile}`
      }
    })
    
    console.log(`Created Deck: ${deck.title}`)
    
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
    
    console.log(`  -> Added ${questions.length} cards`)
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
