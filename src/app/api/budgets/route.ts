import { dbConnect } from "@/lib/mongoose";
import Budget from "@/models/Budget";
import { NextResponse } from "next/server";

// GET all budgets for a month (or all if no month specified)
export async function GET(request: Request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const filter = month ? { month } : {};
  const budgets = await Budget.find(filter);
  return NextResponse.json(budgets);
}

// POST/PUT to set a budget for a category/month
export async function POST(request: Request) {
  await dbConnect();
  const { category, month, amount } = await request.json();
  // Upsert (update if exists, insert if not)
  const budget = await Budget.findOneAndUpdate(
    { category, month },
    { amount },
    { upsert: true, new: true }
  );
  return NextResponse.json(budget);
} 