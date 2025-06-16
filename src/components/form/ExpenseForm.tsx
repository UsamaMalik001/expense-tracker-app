"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputWithLabel } from "../ui/InputWithLabel";
import { expenseSchema } from "@/lib/schema/ExpenseFormSchema";

interface ExpenseFormData {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export default function ExpenseFormDialog({
  session,
  onExpenseAdded,
}: {
  session: Session;
  onExpenseAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "expense",
      category: "",
      date: "",
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    const { error } = await supabase
      .from("expenses")
      .insert({ ...data, user_id: session.user.id });

    if (error) {
      console.error("Error adding expense:", error.message);
      return;
    }

    onExpenseAdded();
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Card className="shadow-lg">
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <InputWithLabel
                label="Title"
                id="title"
                type="text"
                placeholder="Enter expense title"
                {...register("title")}
                hasError={!!errors.title}
                helperText={errors.title?.message}
              />

              <InputWithLabel
                label="Amount"
                id="amount"
                type="text"
                step="0.01"
                placeholder="Enter amount"
                {...register("amount", { valueAsNumber: true })}
                hasError={!!errors.amount}
                helperText={errors.amount?.message}
              />

              <div>
                <Label
                  htmlFor="type"
                  className="inline-block font-medium mb-2.5"
                >
                  Type
                </Label>
                <select
                  id="type"
                  {...register("type")}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <InputWithLabel
                label="Category"
                id="category"
                type="text"
                placeholder="Enter category"
                {...register("category")}
                hasError={!!errors.category}
                helperText={errors.category?.message}
              />

              <InputWithLabel
                label="Date"
                id="date"
                type="date"
                placeholder="Select date"
                {...register("date")}
                hasError={!!errors.date}
                helperText={errors.date?.message}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
