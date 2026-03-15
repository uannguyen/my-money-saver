export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Ăn uống', icon: '🍜', type: 'expense' },
  { id: 'transport', name: 'Đi lại', icon: '🛵', type: 'expense' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', type: 'expense' },
  { id: 'bills', name: 'Sinh hoạt', icon: '🏠', type: 'expense' },
  { id: 'health', name: 'Sức khỏe', icon: '🏥', type: 'expense' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', type: 'expense' },
  { id: 'education', name: 'Học tập', icon: '📚', type: 'expense' },
  { id: 'family', name: 'Gia đình', icon: '👨‍👩‍👦', type: 'expense' },
  { id: 'events', name: 'Tiệc & Sự kiện', icon: '🎉', type: 'expense' },
  { id: 'other_expense', name: 'Khác', icon: '📦', type: 'expense' },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'salary', name: 'Lương', icon: '💼', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', type: 'income' },
  { id: 'bonus', name: 'Thưởng', icon: '🎁', type: 'income' },
  { id: 'debt_collection', name: 'Thu nợ', icon: '🤝', type: 'income' },
  { id: 'other_income', name: 'Khác', icon: '💰', type: 'income' },
]

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
]

export function getCategoryById(categories, id) {
  return categories.find(c => c.id === id) || { id, name: 'Không rõ', icon: '❓', type: 'expense' }
}
