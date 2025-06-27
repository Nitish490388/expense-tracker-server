import z from "zod";

export const expenseSchema = z.object({
    description: z
    .string()
    .min(1, { message: 'Description should not be empty' }),

  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive({ message: 'Amount must be positive' }),
})

export type ExpenseInput = z.infer<typeof expenseSchema>;