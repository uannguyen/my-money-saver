import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import xlsx from 'xlsx'

import { exportToExcel } from './exportExcel.js'

const { readFile } = xlsx

test('exports receipt image links as a Hóa đơn column', async (t) => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'money-export-'))
  t.after(() => rm(tempDir, { recursive: true, force: true }))

  const imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1/receipts/test.jpg'
  const filename = path.join(tempDir, 'transactions')

  exportToExcel(
    [
      {
        type: 'expense',
        amount: 50000,
        categoryId: 'eat_company',
        note: 'Cafe',
        imageUrl,
        date: new Date(2026, 5, 14),
      },
    ],
    [{ id: 'eat_company', name: 'Ăn ngoài(công ty)' }],
    filename
  )

  const workbook = readFile(`${filename}.xlsx`)
  const worksheet = workbook.Sheets['Giao dịch']

  assert.equal(worksheet.G1?.v, 'Hóa đơn')
  assert.equal(worksheet.G2?.v, 'Xem hóa đơn')
  assert.equal(worksheet.G2?.l?.Target, imageUrl)
})
