"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
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
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDate, setNewDate] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const filteredExpenses = expenses.filter((expense) =>
    [expense.title, expense.category].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const deleteExpense = async (id: number) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error.message);
      toast.error("Failed to delete expense.");
      return;
    }
    toast.success("Expense deleted successfully.");
    fetchExpenses();
  };

  const updateExpense = async (id: number) => {
    if (!newTitle || !newAmount || !newType || !newCategory || !newDate) {
      toast.error("Please fill all fields.");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount)) {
      toast.error("Amount must be a valid number.");
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .update({
        title: newTitle,
        amount,
        type: newType,
        category: newCategory,
        date: newDate,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating expense:", error.message);
      toast.error("Failed to update.");
    } else {
      toast.success("Expense updated: " + newTitle);
      setEditingId(null);
      fetchExpenses();
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
  };

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
              className="p-4 border rounded shadow flex justify-between gap-4"
            >
              <div className="flex-1">
                {editingId === expense.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                    />
                    <Input
                      placeholder="Category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="border p-1.5 rounded w-full"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateExpense(expense.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold">
                      {expense.title} - ${expense.amount}
                    </div>
                    <div className="text-sm text-gray-500">
                      {expense.category} | {expense.type} | {expense.date}
                    </div>
                  </>
                )}
              </div>

              {editingId !== expense.id && (
                <div className="flex items-start gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(expense.id);
                      setNewTitle(expense.title);
                      setNewAmount(expense.amount.toString());
                      setNewCategory(expense.category);
                      setNewType(expense.type);
                      setNewDate(expense.date);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
