'use strict'
const prisma = require('../src/db')

async function main() {
  await prisma.transaction.deleteMany()
  await prisma.account.deleteMany()
  await prisma.category.deleteMany()

  const [salary, sidejob, food, utilities, shopping, transport, transfer] =
    await Promise.all([
      prisma.category.create({ data: { name: '給与', type: 'income' } }),
      prisma.category.create({ data: { name: '副業', type: 'income' } }),
      prisma.category.create({ data: { name: '食費', type: 'expense' } }),
      prisma.category.create({ data: { name: '光熱費', type: 'expense' } }),
      prisma.category.create({ data: { name: '買い物', type: 'expense' } }),
      prisma.category.create({ data: { name: '交通費', type: 'expense' } }),
      prisma.category.create({ data: { name: '積立', type: 'transfer' } }),
    ])

  const [checking, savings, investment] = await Promise.all([
    prisma.account.create({
      data: { name: '普通預金（メインバンク）', balance: 485000, type: 'checking' },
    }),
    prisma.account.create({
      data: { name: '定期預金', balance: 1200000, type: 'savings' },
    }),
    prisma.account.create({
      data: { name: '証券口座', balance: 850000, type: 'investment' },
    }),
  ])

  const txData = [
    { date: new Date('2026-02-20'), description: '2月給与', amount: 320000, categoryId: salary.id, accountId: checking.id },
    { date: new Date('2026-02-19'), description: 'スーパー（食材）', amount: -8500, categoryId: food.id, accountId: checking.id },
    { date: new Date('2026-02-18'), description: '電気代', amount: -12000, categoryId: utilities.id, accountId: checking.id },
    { date: new Date('2026-02-17'), description: 'Amazon 購入', amount: -24800, categoryId: shopping.id, accountId: checking.id },
    { date: new Date('2026-02-16'), description: '副業入金', amount: 50000, categoryId: sidejob.id, accountId: checking.id },
    { date: new Date('2026-02-15'), description: 'コンビニ', amount: -1200, categoryId: food.id, accountId: checking.id },
    { date: new Date('2026-02-14'), description: '水道代', amount: -5400, categoryId: utilities.id, accountId: checking.id },
    { date: new Date('2026-02-13'), description: '外食', amount: -6800, categoryId: food.id, accountId: checking.id },
    { date: new Date('2026-02-12'), description: 'ガソリン', amount: -8000, categoryId: transport.id, accountId: checking.id },
    { date: new Date('2026-02-10'), description: '定期積立', amount: -100000, categoryId: transfer.id, accountId: savings.id },
  ]

  for (const tx of txData) {
    await prisma.transaction.create({ data: tx })
  }

  const total = [checking, savings, investment].reduce((s, a) => s + Number(a.balance), 0)
  console.log('✅ Seed complete')
  console.log(`   口座数: 3  取引数: ${txData.length}`)
  console.log(`   純資産合計: ¥${total.toLocaleString('ja-JP')}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
