import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
