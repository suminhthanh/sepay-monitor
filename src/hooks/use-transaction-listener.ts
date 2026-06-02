import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { useTransactionStore } from "@/stores/transactions";
import { useSettingsStore } from "@/stores/settings";
import { insertTransaction, setSinceId } from "@/db/queries";
import { enqueueTts } from "@/lib/tts";
import { buildTtsText } from "@/lib/format";
import type { NewTransaction } from "@/db/schema";

interface NewTransactionEvent {
  id: number;
  transaction_date: string;
  amount_in: number;
  amount_out: number;
  transaction_content: string;
  account_number: string;
  bank_brand_name: string;
}

export function useTransactionListener() {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const settings = useSettingsStore((s) => s.settings);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setup() {
      unlisten = await listen<NewTransactionEvent>("new-transaction", async (event) => {
        const tx = event.payload;

        // Filter: skip debits if creditOnly is on
        if (settings.creditOnly && tx.amount_in <= 0) return;

        const now = new Date().toISOString();
        const newTx: NewTransaction = {
          id: tx.id,
          accountNumber: tx.account_number,
          bankBrandName: tx.bank_brand_name,
          amountIn: tx.amount_in,
          amountOut: tx.amount_out,
          transactionContent: tx.transaction_content,
          transactionDate: tx.transaction_date,
          announced: false,
          createdAt: now,
        };

        // Persist to DB
        await insertTransaction(newTx);
        await setSinceId(tx.id);

        // Update UI store
        addTransaction({
          id: tx.id,
          accountNumber: tx.account_number,
          bankBrandName: tx.bank_brand_name ?? "",
          amountIn: tx.amount_in ?? 0,
          amountOut: tx.amount_out ?? 0,
          transactionContent: tx.transaction_content ?? "",
          transactionDate: tx.transaction_date,
          announced: false,
          createdAt: now,
        });

        // TTS announcement
        if (settings.announcementsEnabled) {
          const text = buildTtsText(tx.amount_in, tx.amount_out);
          enqueueTts(text, settings.ttsVoice || undefined);
        }

        // Desktop notification
        if (settings.notificationsEnabled) {
          let permissionGranted = await isPermissionGranted();
          if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === "granted";
          }
          if (permissionGranted) {
            const title = tx.amount_in > 0
              ? `+${tx.amount_in.toLocaleString("vi-VN")} VND`
              : `-${tx.amount_out.toLocaleString("vi-VN")} VND`;
            sendNotification({
              title,
              body: tx.transaction_content || tx.bank_brand_name,
            });
          }
        }
      });
    }

    setup();
    return () => {
      unlisten?.();
    };
  }, [settings, addTransaction]);
}
