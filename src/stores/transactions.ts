import { create } from "zustand";
import type { Transaction } from "@/db/schema";

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Transaction) => void;
  setLoading: (v: boolean) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  isLoading: false,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions],
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
