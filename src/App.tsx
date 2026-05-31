import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { Dashboard } from "@/pages/Dashboard";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";
import { useTransactionListener } from "@/hooks/use-transaction-listener";
import { useSettingsLoader } from "@/hooks/use-settings-loader";
import { getTransactions } from "@/db/queries";
import { useTransactionStore } from "@/stores/transactions";
import logo from "@/assets/logo.svg";

function App() {
  useSettingsLoader();
  useTransactionListener();

  const setTransactions = useTransactionStore((s) => s.setTransactions);

  useEffect(() => {
    getTransactions(100, 0)
      .then(setTransactions)
      .catch(console.error);
  }, [setTransactions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-6 py-3 flex items-center gap-2">
        <img src={logo} alt="SePay Monitor logo" width={24} height={24} className="rounded-full" />
        <span className="font-semibold text-sm">SePay Monitor</span>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">v0.1.0</span>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b px-6">
          <TabsList className="h-10 bg-transparent p-0 gap-4">
            <TabsTrigger
              value="dashboard"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
            >
              Lịch sử
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2"
            >
              Cài đặt
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <Dashboard />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <History />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <Settings />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}

export default App;
