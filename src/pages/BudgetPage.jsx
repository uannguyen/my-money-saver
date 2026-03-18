import { useState } from "react";
import toast from "react-hot-toast";
import { BudgetCard } from "../components/budget/BudgetCard";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Header } from "../components/layout/Header";
import { CategoryPicker } from "../components/transactions/CategoryPicker";
import {
  ALL_DEFAULT_CATEGORIES,
  getCategoryById
} from "../constants/categories";
import { useBudget } from "../hooks/useBudget";
import { useTransactions } from "../hooks/useTransactions";
import { getMonthKey } from "../utils/dateHelpers";
import { parseVND } from "../utils/formatCurrency";
import "./BudgetPage.css";

export function BudgetPage() {
  const [monthKey, setMonthKey] = useState(getMonthKey(new Date()));
  const { expenseByCategory } = useTransactions(monthKey);
  const { budgets, loading, addBudget, updateBudget, deleteBudget } = useBudget(
    monthKey,
    expenseByCategory
  );

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [formCategoryError, setFormCategoryError] = useState(false);

  const openAdd = () => {
    setEditTarget(null);
    setFormCategoryId("");
    setFormAmount("");
    setFormCategoryError(false);
    setShowForm(true);
  };

  const openEdit = (budget) => {
    setEditTarget(budget);
    setFormCategoryId(budget.categoryId);
    setFormAmount(
      budget.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
    setFormCategoryError(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formCategoryId) {
      setFormCategoryError(true);
      return;
    }
    setFormCategoryError(false);
    const amount = parseVND(formAmount);
    if (!amount) return;

    try {
      if (editTarget) {
        await updateBudget(editTarget.id, {
          categoryId: formCategoryId,
          amount
        });
        toast.success("Đã cập nhật ngân sách");
      } else {
        await addBudget({ categoryId: formCategoryId, amount });
        toast.success("Đã thêm ngân sách");
      }
      setShowForm(false);
    } catch (err) {
      toast.error("Lưu thất bại");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBudget(deleteTarget.id);
      toast.success("Đã xóa ngân sách");
    } catch {
      toast.error("Xóa thất bại");
    }
    setDeleteTarget(null);
  };

  const selectedCategory = formCategoryId
    ? getCategoryById(ALL_DEFAULT_CATEGORIES, formCategoryId)
    : null;

  return (
    <div className="page-container" id="budget-page">
      <Header monthKey={monthKey} onMonthChange={setMonthKey} />

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {budgets.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💰</div>
              <div className="title">Chưa có ngân sách</div>
              <div className="desc">
                Đặt ngân sách cho từng danh mục để kiểm soát chi tiêu
              </div>
            </div>
          ) : (
            <div className="budget-list">
              {budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  categories={ALL_DEFAULT_CATEGORIES}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          <button className="btn btn-primary budget-add-btn" onClick={openAdd}>
            + Thêm ngân sách
          </button>
        </>
      )}

      {/* Add/Edit Budget Form (overlay) */}
      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title">
              {editTarget ? "Sửa ngân sách" : "Thêm ngân sách"}
            </h3>

            <div className="budget-form">
              <label className="txn-form-label">Danh mục</label>
              <button
                type="button"
                className={`budget-category-trigger input${formCategoryError ? " input-error" : ""}`}
                onClick={() => setShowCategoryPicker(true)}
              >
                {selectedCategory ? (
                  <>
                    <span className="budget-category-trigger-icon">
                      {selectedCategory.icon}
                    </span>
                    <span className="budget-category-trigger-name">
                      {selectedCategory.name}
                    </span>
                  </>
                ) : (
                  <span className="budget-category-trigger-placeholder">
                    Chọn danh mục
                  </span>
                )}
              </button>
              {formCategoryError && (
                <p className="budget-form-error">Vui lòng chọn danh mục</p>
              )}

              <label className="txn-form-label" style={{ marginTop: 12 }}>
                Hạn mức (VND)
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="input"
                placeholder="1.000.000"
                value={formAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  if (!raw) {
                    setFormAmount("");
                    return;
                  }
                  setFormAmount(
                    parseInt(raw)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  );
                }}
              />
            </div>

            <div className="dialog-actions" style={{ marginTop: 20 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryPicker && (
        <CategoryPicker
          type="expense"
          selectedId={formCategoryId}
          onSelect={(cat) => {
            setFormCategoryId(cat.id);
            setFormCategoryError(false);
            setShowCategoryPicker(false);
          }}
          onClose={() => setShowCategoryPicker(false)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa ngân sách"
        message="Bạn có chắc chắn muốn xóa ngân sách này?"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
