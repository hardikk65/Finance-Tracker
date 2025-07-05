import mongoose, { Schema, models, model } from "mongoose";

const BudgetSchema = new Schema({
  category: { type: String, required: true },
  month: { type: String, required: true }, // e.g., '2025-07'
  amount: { type: Number, required: true },
});

export default models.Budget || model("Budget", BudgetSchema); 