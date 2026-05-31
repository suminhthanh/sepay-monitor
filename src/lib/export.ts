import type { Transaction } from "@/db/schema";
import ExcelJS from "exceljs";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

export async function exportToExcel(transactions: Transaction[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Giao dịch");

  sheet.columns = [
    { header: "ID", key: "id", width: 12 },
    { header: "Thời gian", key: "transactionDate", width: 22 },
    { header: "Ngân hàng", key: "bankBrandName", width: 18 },
    { header: "Số tài khoản", key: "accountNumber", width: 20 },
    { header: "Tiền vào", key: "amountIn", width: 16 },
    { header: "Tiền ra", key: "amountOut", width: 16 },
    { header: "Nội dung", key: "transactionContent", width: 40 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  for (const tx of transactions) {
    sheet.addRow({
      id: tx.id,
      transactionDate: tx.transactionDate,
      bankBrandName: tx.bankBrandName,
      accountNumber: tx.accountNumber,
      amountIn: tx.amountIn,
      amountOut: tx.amountOut,
      transactionContent: tx.transactionContent,
    });
  }

  // Format currency columns
  ["amountIn", "amountOut"].forEach((key) => {
    const col = sheet.getColumn(key);
    col.numFmt = '#,##0';
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const uint8 = new Uint8Array(buffer as ArrayBuffer);

  const filePath = await save({
    defaultPath: `sepay-transactions-${new Date().toISOString().slice(0, 10)}.xlsx`,
    filters: [{ name: "Excel", extensions: ["xlsx"] }],
  });

  if (filePath) {
    await writeFile(filePath, uint8);
  }
}
