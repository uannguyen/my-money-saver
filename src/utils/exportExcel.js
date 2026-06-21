import { utils, writeFile } from "xlsx";
import { getCategoryById } from "../constants/categories.js";
import { formatVND } from "./formatCurrency.js";

/**
 * Export transactions to Excel
 */
export function exportToExcel(transactions, categories, filename = "chi-tieu") {
  const data = transactions.map((txn) => {
    const cat = getCategoryById(categories, txn.categoryId);
    const date = txn.date instanceof Date ? txn.date : new Date(txn.date);
    return {
      Ngày: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      Loại: txn.type === "income" ? "Thu" : "Chi",
      "Danh mục": cat.name,
      "Số tiền": txn.amount,
      "Số tiền (VND)": formatVND(txn.amount),
      "Ghi chú": txn.note || "",
      "Hóa đơn": txn.imageUrl ? txn.imageUrl : ""
    };
  });

  const ws = utils.json_to_sheet(data);

  transactions.forEach((txn, index) => {
    if (!txn.imageUrl) return;

    const cellAddress = utils.encode_cell({ c: 6, r: index + 1 });
    if (!ws[cellAddress]) return;

    ws[cellAddress].l = {
      Target: txn.imageUrl,
      Tooltip: "Mở hình ảnh hóa đơn"
    };
  });

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Giao dịch");

  // Set column widths
  ws["!cols"] = [
    { wch: 12 },
    { wch: 6 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 30 },
    { wch: 16 }
  ];

  writeFile(wb, `${filename}.xlsx`);
}
