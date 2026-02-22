'use strict'
const express = require('express')
const prisma = require('./db')

const app = express()
const PORT = process.env.PORT || 3000

// ── helpers ──────────────────────────────────────────────────────────────────

function yen(amount) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}

const ACCOUNT_META = {
  checking:   { label: '普通預金', icon: '💳' },
  savings:    { label: '定期預金', icon: '🏦' },
  investment: { label: '証券口座', icon: '📈' },
}

// ── HTML renderer ─────────────────────────────────────────────────────────────

function renderDashboard({ accounts, transactions, totalBalance }) {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  const accountCards = accounts.map((a) => {
    const meta = ACCOUNT_META[a.type] ?? { label: a.type, icon: '🏛' }
    return `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">${meta.icon}</span>
          <div>
            <p class="text-xs text-gray-400 font-medium">${meta.label}</p>
            <p class="text-sm font-semibold text-gray-700">${a.name}</p>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">${yen(Number(a.balance))}</p>
      </div>`
  }).join('')

  const txRows = transactions.length
    ? transactions.map((tx) => {
        const amt = Number(tx.amount)
        const amtClass = amt >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-500'
        const amtStr = amt >= 0 ? `+${yen(amt)}` : yen(amt)
        const dateStr = new Date(tx.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
        return `
          <tr class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-5 text-sm text-gray-400 whitespace-nowrap">${dateStr}</td>
            <td class="py-3 px-5 text-sm text-gray-800">${tx.description}</td>
            <td class="py-3 px-5">
              <span class="inline-block text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                ${tx.category?.name ?? '-'}
              </span>
            </td>
            <td class="py-3 px-5 text-sm text-gray-400">${tx.account?.name ?? '-'}</td>
            <td class="py-3 px-5 text-sm text-right ${amtClass}">${amtStr}</td>
          </tr>`
      }).join('')
    : `<tr><td colspan="5" class="py-10 text-center text-gray-400 text-sm">取引データがありません</td></tr>`

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>家計ダッシュボード</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen font-sans">

  <!-- Header -->
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <h1 class="text-lg font-bold text-gray-800">💰 家計ダッシュボード</h1>
      <span class="text-sm text-gray-400">${today}</span>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-6 py-8 space-y-8">

    <!-- 純資産カード -->
    <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
      <p class="text-sm font-medium opacity-70 mb-2 tracking-wide">純資産（全口座合計）</p>
      <p class="text-5xl font-extrabold tracking-tight">${yen(totalBalance)}</p>
      <p class="text-xs opacity-50 mt-4">${today} 現在</p>
    </div>

    <!-- 口座内訳 -->
    <section>
      <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">口座内訳</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${accountCards}
      </div>
    </section>

    <!-- 最近の取引 -->
    <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-sm font-semibold text-gray-700">最近の取引（直近 10 件）</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="py-2 px-5 text-left text-xs font-medium text-gray-400">日付</th>
              <th class="py-2 px-5 text-left text-xs font-medium text-gray-400">内容</th>
              <th class="py-2 px-5 text-left text-xs font-medium text-gray-400">カテゴリ</th>
              <th class="py-2 px-5 text-left text-xs font-medium text-gray-400">口座</th>
              <th class="py-2 px-5 text-right text-xs font-medium text-gray-400">金額</th>
            </tr>
          </thead>
          <tbody>${txRows}</tbody>
        </table>
      </div>
    </section>

  </main>
</body>
</html>`
}

// ── Route ─────────────────────────────────────────────────────────────────────

app.get('/', async (req, res) => {
  try {
    const [accounts, transactions] = await Promise.all([
      prisma.account.findMany({ orderBy: { name: 'asc' } }),
      prisma.transaction.findMany({
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ])
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
    res.send(renderDashboard({ accounts, transactions, totalBalance }))
  } catch (err) {
    console.error(err)
    res.status(500).send(`<pre style="padding:2rem;color:red">${err.stack}</pre>`)
  }
})

app.listen(PORT, () => {
  console.log(`Dashboard → http://localhost:${PORT}`)
})
