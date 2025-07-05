"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, RefreshCcw, PlusCircle, X, Save } from "lucide-react";
import { fetchTransactions, updateTransaction, deleteTransaction } from '@/lib/api';
import Link from "next/link";

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      title: transaction.title,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      description: transaction.description,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    try {
      await updateTransaction(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      await loadTransactions(); // Refresh the list
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      await loadTransactions(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Shopping': '#4287f5',
      'Bills & Utilities': '#f54242',
      'Healthcare': '#42f5b3',
      'Groceries': '#f5a142',
      'Transportation': '#a142f5',
      'Food & Dining': '#f542a7',
      'Other': '#b3b3b3',
      'Home & Garden': '#b3f542'
    };
    return colors[category as keyof typeof colors] || '#b3b3b3';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-xl">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Transactions</h1>
            <p className="text-md text-gray-400">Manage your financial transactions</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="border-zinc-700 text-white bg-zinc-900 hover:bg-zinc-800"
              onClick={loadTransactions}
            >
              <RefreshCcw className="mr-2" size={18} /> Refresh
            </Button>
            <Link href="/add-transaction">
              <Button className="bg-white text-black hover:bg-gray-200">
                <PlusCircle className="mr-2" size={18} /> Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Transaction List */}
        <ScrollArea className="h-[70vh] w-full pr-2">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-700 text-white">
                <CardContent className="p-8 text-center">
                  <div className="text-xl mb-2">No transactions found</div>
                  <div className="text-gray-400 mb-4">Start by adding your first transaction</div>
                  <Link href="/add-transaction">
                    <Button className="bg-white text-black hover:bg-gray-200">
                      <PlusCircle className="mr-2" size={18} /> Add Transaction
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx._id} className="bg-zinc-900 border-zinc-700 text-white shadow rounded-xl">
                  <CardContent className="flex items-center justify-between py-4">
                    {editingId === tx._id ? (
                      // Edit Mode
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-1 w-full"
                          placeholder="Title"
                        />
                        <input
                          type="number"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                          className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-1 w-full"
                          placeholder="Amount"
                        />
                        <input
                          type="text"
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-1 w-full"
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="font-semibold text-lg">{tx.title}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <span>{new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          <Badge 
                            className="ml-2" 
                            style={{ backgroundColor: getCategoryColor(tx.category) }}
                          >
                            {tx.category}
                          </Badge>
                        </div>
                        {tx.description && (
                          <div className="text-sm text-gray-500 mt-1">{tx.description}</div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {editingId === tx._id ? (
                        // Edit Mode Actions
                        <>
                          <div className="font-bold text-xl">${editForm.amount?.toFixed(2) || tx.amount.toFixed(2)}</div>
                          <Button size="icon" variant="ghost" className="text-green-400 hover:bg-green-600" onClick={handleSave}>
                            <Save size={18} />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:bg-gray-600" onClick={handleCancel}>
                            <X size={18} />
                          </Button>
                        </>
                      ) : (
                        // View Mode Actions
                        <>
                          <div className="font-bold text-xl">${tx.amount.toFixed(2)}</div>
                          <Button size="icon" variant="ghost" className="text-white hover:bg-zinc-800" onClick={() => handleEdit(tx)}>
                            <Pencil size={18} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-600"
                                onClick={() => setDeleteId(tx._id)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete &quot;{tx.title}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel 
                                  className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                                  onClick={() => setDeleteId(null)}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={handleDelete}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}