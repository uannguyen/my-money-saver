/**
 * import-transactions.mjs
 *
 * Script để import dữ liệu từ file CSV của Money Keeper vào Firebase Firestore
 * của ứng dụng My Money Saver.
 *
 * Cách dùng:
 *   1. Tải firebase-service-account.json từ Firebase Console:
 *      Project Settings → Service accounts → Generate new private key
 *   2. Đặt file json vào thư mục gốc của project
 *   3. Cài dependencies: npm install firebase-admin csv-parse dotenv
 *   4. Sửa USER_ID bên dưới (lấy từ Firebase Console > Authentication)
 *   5. Chạy: node import-transactions.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// ⚙️ CẤU HÌNH - Chỉnh sửa trước khi chạy
// ============================================================

// UID của user trong Firebase (Firebase Console > Authentication > Users)
const USER_ID = 'YOUR_FIREBASE_USER_UID';

// Đường dẫn tới file CSV
const CSV_FILE = join(__dirname, '2026 - main.csv');

// Đường dẫn tới file service account JSON
const SERVICE_ACCOUNT_PATH = join(__dirname, 'firebase-service-account.json');

// ============================================================
// 🗂️ MAPPING CATEGORIES
// ============================================================

const EXPENSE_CATEGORY_MAP = {
  // Ăn uống
  'Food and Dining':      'food',

  // Đi lại
  'Đi lại':              'transport',

  // Mua sắm
  'Mua sắm':             'shopping',

  // Hóa đơn / Tiện ích
  'Utilities':            'bills',

  // Sức khỏe
  'Health & Fitness':     'health',
  'Health &amp; Fitness': 'health',

  // Giải trí
  'Vui chơi - Giải trí': 'entertainment',

  // Gia đình
  'Gia Đình Lớn':        'family',

  // Tiệc & Sự kiện
  'Tiệc & Lễ':           'events',
  'Tiệc &amp; Lễ':       'events',

  // Khác (Personal, Hoạt động xã hội...)
  'Personal':             'other_expense',
  'Hoạt động xã hội':    'other_expense',
};

const INCOME_CATEGORY_MAP = {
  'Salary':            'salary',
  'Bonus':             'bonus',
  'Awarded':           'bonus',
  'Collecting debts':  'debt_collection',
  'Other':             'other_income',
};

// Categories bị bỏ qua (vay mượn, trả nợ)
const SKIP_CATEGORIES = new Set(['Lend', 'Repayment']);

// ============================================================
// 🛠️ HELPERS
// ============================================================

/** Parse amount string "1.234.567" → 1234567 */
function parseAmount(str) {
  if (!str || !str.trim() || str.trim() === '       ') return 0;
  return parseInt(str.replace(/\./g, '').replace(/,/g, '').trim(), 10) || 0;
}

/** Parse date string "3/14/2026" + "21:00" → Date */
function parseDate(dateStr, timeStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const [hour, minute] = (timeStr || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

/** Simple unique ID */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============================================================
// 🚀 MAIN
// ============================================================

async function main() {
  const { default: serviceAccount } = await import(SERVICE_ACCOUNT_PATH, {
    assert: { type: 'json' },
  });

  initializeApp({ credential: cert(serviceAccount) });

  const db = getFirestore();
  const transactionsRef = db.collection('users').doc(USER_ID).collection('transactions');

  console.log('🚀 Bắt đầu import...');
  console.log(`📁 File: ${CSV_FILE}`);
  console.log(`👤 User ID: ${USER_ID}\n`);

  let imported = 0, skipped = 0, errors = 0;

  // Đọc và parse CSV
  const records = [];
  await new Promise((resolve, reject) => {
    createReadStream(CSV_FILE)
      .pipe(parse({ skip_empty_lines: true, relax_quotes: true, relax_column_count: true }))
      .on('data', (row) => records.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  // Tìm dòng header
  const headerIndex = records.findIndex((r) => r[0] === 'No');
  if (headerIndex === -1) throw new Error('Không tìm thấy header trong CSV!');

  const dataRows = records.slice(headerIndex + 1);
  console.log(`📊 Tổng giao dịch trong CSV: ${dataRows.length}\n`);

  // Ghi theo batch
  let batch = db.batch();
  let batchCount = 0;

  for (const row of dataRows) {
    try {
      const no = row[0]?.trim();
      if (!no || isNaN(Number(no))) continue;

      const dateStr         = row[1]?.trim();
      const timeStr         = row[2]?.trim();
      const incomeAmountStr = row[3];
      const expenseAmountStr = row[4];
      const parentCategory  = row[6]?.trim() || '';
      const subCategory     = row[7]?.trim() || '';
      const description     = row[10]?.trim() || '';

      if (SKIP_CATEGORIES.has(parentCategory)) {
        skipped++;
        continue;
      }

      const incomeAmount  = parseAmount(incomeAmountStr);
      const expenseAmount = parseAmount(expenseAmountStr);

      let type, amount, categoryId;

      if (incomeAmount > 0) {
        type = 'income';
        amount = incomeAmount;
        categoryId = INCOME_CATEGORY_MAP[parentCategory] || 'other_income';
      } else if (expenseAmount > 0) {
        type = 'expense';
        amount = expenseAmount;
        categoryId = EXPENSE_CATEGORY_MAP[parentCategory] || 'other_expense';
      } else {
        skipped++;
        continue;
      }

      if (!parentCategory && !subCategory) { skipped++; continue; }

      const date = parseDate(dateStr, timeStr);

      // Ghép sub-category tiếng Việt vào ghi chú
      const subVi = translateSub(subCategory);
      const note = [subVi, description].filter(Boolean).join(' – ') || '';

      const transaction = {
        type,
        amount,
        categoryId,
        note,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
        imported: true,
        importedFrom: 'money-keeper-csv',
      };

      const docRef = transactionsRef.doc(generateId());
      batch.set(docRef, transaction);
      batchCount++;
      imported++;

      if (batchCount === 400) {
        await batch.commit();
        console.log(`✅ Đã import ${imported} giao dịch...`);
        batch = db.batch();
        batchCount = 0;
      }
    } catch (err) {
      errors++;
      console.error(`❌ Lỗi tại row ${row[0]}:`, err.message);
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log('\n🎉 HOÀN THÀNH!');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped:  ${skipped}`);
  console.log(`   ❌ Errors:   ${errors}`);
}

/** Dịch sub-category từ tiếng Anh → tiếng Việt */
function translateSub(sub) {
  const map = {
    'Pharmacy':   'Nhà thuốc',
    'Sports':     'Thể dục thể thao',
    'Accessories': 'Phụ kiện',
    'Clothes':    'Quần áo',
    'Shoes':      'Giày dép',
    'Education':  'Học tập',
    'Internet':   'Internet',
    'Mobile Phone': 'Điện thoại',
  };
  return map[sub] || sub;
}

main().catch((err) => {
  console.error('💥 Lỗi:', err);
  process.exit(1);
});
