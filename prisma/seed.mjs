import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.card.deleteMany({})
  await prisma.deck.deleteMany({})

  const deck = await prisma.deck.create({
    data: {
      title: 'VCA VOL - Chapter 1',
      description: 'First chapter of VCA VOL'
    }
  })
  
  console.log(`Created Deck: ${deck.title}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
