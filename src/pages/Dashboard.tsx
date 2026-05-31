import { useTransactionStore } from "@/stores/transactions";
import { useSettingsStore } from "@/stores/settings";
import { formatCurrencyVi, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  const transactions = useTransactionStore((s) => s.transactions);
  const settings = useSettingsStore((s) => s.settings);

  const recent = transactions.slice(0, 10);
  const todayTotal = transactions
    .filter((tx) => {
      const today = new Date().toDateString();
      return new Date(tx.transactionDate).toDateString() === today && tx.amountIn > 0;
    })
    .reduce((sum, tx) => sum + tx.amountIn, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thu nhập hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrencyVi(todayTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giao dịch hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((tx) => {
                const today = new Date().toDateString();
                return new Date(tx.transactionDate).toDateString() === today;
              }).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {settings.apiToken
                ? "Đang chờ giao dịch mới..."
                : "Vui lòng cấu hình API token trong Cài đặt"}
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {tx.transactionContent || tx.bankBrandName || "Giao dịch"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.transactionDate)} · {tx.bankBrandName}
                    </p>
                  </div>
                  <div className="text-right">
                    {tx.amountIn > 0 && (
                      <Badge variant="default" className="bg-green-600 text-white">
                        +{formatCurrencyVi(tx.amountIn)}
                      </Badge>
                    )}
                    {tx.amountOut > 0 && (
                      <Badge variant="destructive">
                        -{formatCurrencyVi(tx.amountOut)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
