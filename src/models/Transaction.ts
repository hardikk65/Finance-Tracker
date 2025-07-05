import mongoose, { Schema, models, model } from "mongoose";

const TransactionSchema = new Schema({
  title: String,
  amount: Number,
  date: Date,
  category: String,
  description: String,
});

export default models.Transaction || model("Transaction", TransactionSchema);
