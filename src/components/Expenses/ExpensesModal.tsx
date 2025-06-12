"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import ExpenseForm from "../form/ExpenseForm";
import dayjs from "dayjs";
import { Input } from "../ui/input";
import { formatCurrency } from "@/lib/utils";

export default function ExpensesPage({ session }: { session: Session }) {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "this_month" | "last_30_days"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExpenses = async () => {
    let query = supabase.from("expenses").select("*");

    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    if (dateFilter === "this_month") {
      const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
      query = query.gte("date", startOfMonth);
    } else if (dateFilter === "last_30_days") {
      const last30 = dayjs().subtract(30, "day").format("YYYY-MM-DD");
      query = query.gte("date", last30);
    }

    const { data, error } = await query.order("date", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setExpenses(data || []);

      const income =
        data
          ?.filter((e) => e.type === "income")
          .reduce((sum, e) => sum + e.amount, 0) || 0;
      const expense =
        data
          ?.filter((e) => e.type === "expense")
          .reduce((sum, e) => sum + e.amount, 0) || 0;

      setTotalIncome(income);
      setTotalExpense(expense);
      setBalance(income - expense);
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error.message);
      toast.error("Failed to delete expense.");
      return;
    }
    toast.success("Expense deleted successfully.");
    fetchExpenses();
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const filteredExpenses = expenses.filter((expense) =>
    [expense.title, expense.category].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  useEffect(() => {
    fetchExpenses();
  }, [typeFilter, dateFilter]);

  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="justify-between flex">
        <Button onClick={logout}>Log out</Button>
        <span className="text-xl font-bold text-gray-900">
          {session.user.email}
        </span>
        <ExpenseForm session={session} onExpenseAdded={fetchExpenses} />
      </div>
      <div className="flex flex-wrap gap-3 mt-6 items-center justify-between">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border p-1.5 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as any)}
          className="border p-1.5 rounded-lg"
        >
          <option value="all">All Dates</option>
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
        </select>

        <Input
          type="text"
          placeholder="Search by title or category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 mb-6">
        <div className="p-4 border rounded bg-green-50 text-green-800">
          <p className="text-sm font-medium">Total Income</p>
          <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="p-4 border rounded bg-red-50 text-red-800">
          <p className="text-sm font-medium">Total Expense</p>
          <p className="text-xl font-bold">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="p-4 border rounded bg-blue-50 text-blue-800">
          <p className="text-sm font-medium">Current Balance</p>
          <p className="text-xl font-bold">{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {filteredExpenses.length === 0 ? (
          <p className="text-sm text-center text-gray-500">
            No expenses found.
          </p>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 border rounded shadow flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {expense.title} - ${expense.amount}
                </div>
                <div className="text-sm text-gray-500">
                  {expense.category} | {expense.type} | {expense.date}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTask(expense.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
