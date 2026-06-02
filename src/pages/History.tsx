import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { useTransactionStore } from "@/stores/transactions";
import { useSettingsStore } from "@/stores/settings";
import { getTransactions } from "@/db/queries";
import { formatCurrencyVi, formatDate, buildTtsText } from "@/lib/format";
import { enqueueTts } from "@/lib/tts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToExcel } from "@/lib/export";

export function History() {
  const { transactions, setTransactions, setLoading, isLoading } = useTransactionStore();
  const ttsVoice = useSettingsStore((s) => s.settings.ttsVoice);
  const [exporting, setExporting] = useState(false);

  function handlePlay(tx: (typeof transactions)[number]) {
    const text = buildTtsText(tx.amountIn, tx.amountOut);
    enqueueTts(text, ttsVoice || undefined);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const rows = await getTransactions(200, 0);
        setTransactions(rows);
      } catch (e) {
        console.error("Failed to load transactions:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setTransactions, setLoading]);

  async function handleExport() {
    setExporting(true);
    try {
      await exportToExcel(transactions);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lịch sử giao dịch</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting || transactions.length === 0}
        >
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Đang tải...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Chưa có giao dịch nào
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Ngân hàng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead className="text-right">Tiền vào</TableHead>
                <TableHead className="text-right">Tiền ra</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(tx.transactionDate)}
                  </TableCell>
                  <TableCell className="text-sm">{tx.bankBrandName}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {tx.transactionContent}
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.amountIn > 0 && (
                      <Badge className="bg-green-600 text-white text-xs">
                        +{formatCurrencyVi(tx.amountIn)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.amountOut > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{formatCurrencyVi(tx.amountOut)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePlay(tx)}
                      title="Phát âm thanh"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
