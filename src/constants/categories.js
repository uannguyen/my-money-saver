/**
 * Two-level category system.
 * Each parent has `subs: []` — sub-categories used as `categoryId` in transactions.
 */

export const DEFAULT_EXPENSE_PARENTS = [
  {
    id: 'food',
    name: 'Ăn uống',
    icon: '🍜',
    type: 'expense',
    subs: [
      { id: 'eat_company', name: 'Ăn ngoài(công ty)', icon: '🍱' },
      { id: 'eat_snack', name: 'Ăn/Uống vặt', icon: '🧋' },
      { id: 'eat_supermarket', name: 'Siêu thị / Chợ', icon: '🛒' },
      { id: 'eat_outside', name: 'Ăn ngoài(nhà)', icon: '🍜' },
      { id: 'eat_party', name: 'Ăn nhậu', icon: '🍺' },
    ],
  },
  {
    id: 'transport',
    name: 'Đi lại',
    icon: '🛵',
    type: 'expense',
    subs: [
      { id: 'transport_gas', name: 'Xăng xe', icon: '⛽' },
      { id: 'transport_grab', name: 'Grab/Taxi', icon: '🚖' },
      { id: 'transport_parking', name: 'Gửi xe', icon: '🅿️' },
    ],
  },
  {
    id: 'shopping',
    name: 'Mua sắm',
    icon: '🛍️',
    type: 'expense',
    subs: [
      { id: 'shopping_clothes', name: 'Quần áo/Giày dép', icon: '👕' },
      { id: 'shopping_accessory', name: 'Phụ kiện', icon: '⌚' },
      { id: 'shopping_cosmetic', name: 'Mỹ phẩm', icon: '💄' },
    ],
  },
  {
    id: 'utilities',
    name: 'Sinh hoạt',
    icon: '🏠',
    type: 'expense',
    subs: [
      { id: 'utilities_rent', name: 'Thuê nhà', icon: '🏠' },
      { id: 'utilities_phone', name: 'Điện thoại', icon: '📱' },
      { id: 'utilities_other', name: 'Tiện ích khác', icon: '💡' },
    ],
  },
  {
    id: 'health',
    name: 'Sức khỏe',
    icon: '🏥',
    type: 'expense',
    subs: [
      { id: 'health_general', name: 'Khám / Thuốc', icon: '🏥' },
      { id: 'health_sport', name: 'Thể thao', icon: '⚽' },
    ],
  },
  {
    id: 'social',
    name: 'Gia đình & Xã hội',
    icon: '👨‍👩‍👦',
    type: 'expense',
    subs: [
      { id: 'social_family', name: 'Gia đình', icon: '👨‍👩‍👦' },
      { id: 'social_event', name: 'Tiệc & Lễ', icon: '🎉' },
      { id: 'social_general', name: 'Hoạt động xã hội', icon: '🤝' },
    ],
  },
  {
    id: 'entertainment',
    name: 'Giải trí',
    icon: '🎮',
    type: 'expense',
    subs: [
      { id: 'enter_fun', name: 'Vui chơi/Giải trí', icon: '🎮' },
    ],
  },
  {
    id: 'personal',
    name: 'Cá nhân',
    icon: '📚',
    type: 'expense',
    subs: [
      { id: 'personal_edu', name: 'Học tập', icon: '📚' },
      { id: 'personal_general', name: 'Cá nhân', icon: '👤' },
    ],
  },
  {
    id: 'other_expense',
    name: 'Khác',
    icon: '💸',
    type: 'expense',
    subs: [
      { id: 'lend', name: 'Cho mượn', icon: '💸' },
      { id: 'other_exp', name: 'Khác', icon: '📦' },
    ],
  },
]

export const DEFAULT_INCOME_PARENTS = [
  {
    id: 'income_salary',
    name: 'Lương',
    icon: '💼',
    type: 'income',
    subs: [
      { id: 'salary', name: 'Lương', icon: '💼' },
    ],
  },
  {
    id: 'income_bonus',
    name: 'Thưởng / Awarded',
    icon: '🎁',
    type: 'income',
    subs: [
      { id: 'bonus', name: 'Thưởng / Awarded', icon: '🎁' },
    ],
  },
  {
    id: 'income_debt',
    name: 'Thu nợ',
    icon: '🪙',
    type: 'income',
    subs: [
      { id: 'debt_collect', name: 'Thu nợ', icon: '🪙' },
    ],
  },
  {
    id: 'income_other',
    name: 'Thu nhập khác',
    icon: '💰',
    type: 'income',
    subs: [
      { id: 'other_inc', name: 'Thu nhập khác', icon: '💰' },
    ],
  },
]

export const ALL_DEFAULT_PARENTS = [
  ...DEFAULT_EXPENSE_PARENTS,
  ...DEFAULT_INCOME_PARENTS,
]

/** Flat list of all categories (subs + parents) for transaction lookup by categoryId */
export const ALL_DEFAULT_CATEGORIES = ALL_DEFAULT_PARENTS.flatMap((parent) => {
  const subs = parent.subs.map((sub) => ({
    ...sub,
    type: parent.type,
    parentId: parent.id,
    parentName: parent.name,
  }))
  return [...subs, { ...parent, parentId: null, parentName: null }]
})

// IDs that cannot be deleted
export const DEFAULT_PARENT_IDS = new Set(ALL_DEFAULT_PARENTS.map((p) => p.id))
export const DEFAULT_SUB_IDS = new Set(ALL_DEFAULT_CATEGORIES.map((s) => s.id))

export function getCategoryById(categories, id) {
  return categories.find((c) => c.id === id) || { id, name: 'Không rõ', icon: '❓', type: 'expense' }
}
