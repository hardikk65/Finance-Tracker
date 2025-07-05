import { dbConnect } from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

// GET 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const transaction = await Transaction.findById(id);
  return NextResponse.json(transaction);
}

// PUT 
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  const data = await request.json();
  const transaction = await Transaction.findByIdAndUpdate(id, data, { new: true });
  return NextResponse.json(transaction);
}

// DELETE 
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  await Transaction.findByIdAndDelete(id);
  return NextResponse.json({ message: "Transaction deleted successfully" });
} 