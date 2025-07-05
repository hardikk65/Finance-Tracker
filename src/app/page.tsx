"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchTransactions, fetchBudgets, setBudget } from '@/lib/api';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
};

type TooltipEntry = {
  color?: string;
  name?: string;
  value?: number;
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 text-white rounded-md px-4 py-2 shadow">
      <div className="font-semibold mb-1">{String(label)}</div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || '#b3b3b3' }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function groupByMonth(transactions: Transaction[]) {
  const monthlyMap = new Map<string, number>();
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + tx.amount);
  });
  return Array.from(monthlyMap.entries()).map(([month, amount]) => ({ month, amount }));
}

function groupByCategory(transactions: Transaction[]) {
  const categoryMap = new Map<string, number>();
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  transactions.forEach(tx => {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  });
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: total ? Math.round((value / total) * 100) : 0,
    color: getCategoryColor(name)
  }));
}

function calculateBudgetVsActual() {
  return [];
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'food & dining': '#f542a7',
    'home & garden': '#b3f542',
    'transportation': '#a142f5',
    'shopping': '#4287f5',
    'entertainment': '#f54242',
    'bills & utilities': '#f54242',
    'health': '#42f5b3',
    'healthcare': '#42f5b3',
    'travel': '#f5a142',
    'education': '#a142f5',
    'groceries': '#f5a142',
    'other': '#b3b3b3'
  };
  return colors[category.toLowerCase()] || '#b3b3b3';
}

function getContrastText(bgColor: string) {
  // luminance check 
  if (!bgColor) return '#fff';
  const color = bgColor.replace('#', '');
  const r = parseInt(color.substring(0,2), 16);
  const g = parseInt(color.substring(2,4), 16);
  const b = parseInt(color.substring(4,6), 16);
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.6 ? '#222' : '#fff';
}

function processTransactionsForCharts(transactions: Transaction[]) {
  const monthlyData = groupByMonth(transactions);
  const categoryData = groupByCategory(transactions);
  const budgetData = calculateBudgetVsActual();
  return { monthlyData, categoryData, budgetData };
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetInputs, setBudgetInputs] = useState<{ [category: string]: string }>({});
  const [budgetMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  useEffect(() => {
    async function loadBudgets() {
      setBudgetLoading(true);
      try {
        const data = await fetchBudgets(budgetMonth);
        const inputObj: { [category: string]: string } = {};
        data.forEach((b: { category: string; amount: number }) => {
          inputObj[b.category] = b.amount.toString();
        });
        setBudgetInputs(inputObj);
      } catch (error) {
        console.error('Failed to load budgets:', error);
      } finally {
        setBudgetLoading(false);
      }
    }
    loadBudgets();
  }, [budgetMonth]);

  // Process transactions for charts
  const { monthlyData, categoryData } = processTransactionsForCharts(transactions);
  
  // Calculate summary stats
  const totalSpending = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransactions = transactions.length;
  const uniqueCategories = new Set(transactions.map(tx => tx.category)).size;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  let spendingInsight = '';
  if (monthlyData.length > 1) {
    const last = monthlyData[monthlyData.length - 1].amount;
    const prev = monthlyData[monthlyData.length - 2].amount;
    if (last > prev) {
      spendingInsight = `You spent $${(last - prev).toFixed(2)} more than the previous month.`;
    } else if (last < prev) {
      spendingInsight = `Great! You spent $${(prev - last).toFixed(2)} less than the previous month.`;
    } else {
      spendingInsight = `Your spending is the same as last month.`;
    }
  }

  const allCategories = [
    'Food & Dining',
    'Home & Garden',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health',
    'Travel',
    'Education',
    'Groceries',
    'Other',
  ];

  const budgetData = allCategories.map((category) => {
    const budget = Number(budgetInputs[category] || 0);
    const actual = transactions
      .filter((tx) => tx.category.toLowerCase() === category.toLowerCase())
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      category,
      budget,
      actual,
    };
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  async function handleBudgetChange(category: string, value: string) {
    setBudgetInputs((prev) => ({ ...prev, [category]: value }));
  }

  async function handleSaveAllBudgets() {
    setBudgetLoading(true);
    try {
      for (const category of allCategories) {
        await setBudget(category, budgetMonth, Number(budgetInputs[category] || 0));
      }
      await fetchBudgets(budgetMonth);
    } catch (error) {
      console.error('Failed to save budgets:', error);
    } finally {
      setBudgetLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-md text-gray-400 mb-8">Overview of your financial activity</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400 mb-1">Total Spending</div>
              <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
              <div className="text-xs text-gray-500">All time total</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <div className="text-xs text-gray-500">All time</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400 mb-1">Categories</div>
              <div className="text-2xl font-bold">{uniqueCategories}</div>
              <div className="text-xs text-gray-500">Active categories</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="text-sm text-gray-400 mb-1">Period</div>
              <div className="text-2xl font-bold">All Time</div>
              <div className="text-xs text-gray-500">Current reporting period</div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Insight */}
        {spendingInsight && (
          <div className="mb-6 text-center text-lg font-semibold text-blue-400">{spendingInsight}</div>
        )}

        {/* Recent Transactions Card */}
        <Card className="bg-zinc-900 border-zinc-700 text-white mb-8">
          <CardContent className="p-4">
            <div className="font-bold text-lg mb-2">Recent Transactions</div>
            {recentTransactions.length === 0 ? (
              <div className="text-gray-400">No recent transactions.</div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {recentTransactions.map((tx) => (
                  <li key={tx._id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{tx.title}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        {tx.category && (
                          <Badge 
                            variant="outline" 
                            className="ml-2 border-0"
                            style={{ backgroundColor: getCategoryColor(tx.category), color: getContrastText(getCategoryColor(tx.category)) }}
                          >
                            {tx.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="font-bold">${tx.amount.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Budget Setting Section */}
        <Card className="bg-zinc-900 border-zinc-700 text-white mb-8">
          <CardContent className="p-4">
            <div className="font-bold text-lg mb-2">Set Monthly Budgets</div>
            <div className="flex flex-wrap gap-4">
              {allCategories.map((category) => (
                <div key={category} className="flex flex-col items-start">
                  <Badge 
                    variant="outline" 
                    className="text-white mb-1 bg-zinc-800 border-zinc-700"
                  >
                    {category}
                  </Badge>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      value={budgetInputs[category] || ''}
                      onChange={(e) => handleBudgetChange(category, e.target.value)}
                      className="bg-zinc-800 text-white border border-zinc-700 rounded px-2 py-1 w-24"
                      placeholder="0"
                      disabled={budgetLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                onClick={handleSaveAllBudgets}
                disabled={budgetLoading}
              >
                Save All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Monthly Expenses Bar Chart */}
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="font-bold text-lg mb-2">Monthly Expenses</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip content={CustomTooltip} />
                  <Bar dataKey="amount" fill="#4287f5" radius={[8, 8, 0, 0]} activeBar={{ fill: "#2563eb" }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Category Breakdown Pie Chart */}
          <Card className="bg-zinc-900 border-zinc-700 text-white">
            <CardContent className="p-4">
              <div className="font-bold text-lg mb-2">Category Breakdown</div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ index }) => `${categoryData[index ?? 0].value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend below the chart, but inside CardContent */}
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="border-0"
                      style={{ backgroundColor: entry.color, color: getContrastText(entry.color) }}
                    >
                      {entry.name}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Actual Spending Chart */}
        <Card className="bg-zinc-900 border-zinc-700 text-white">
          <CardContent className="p-4">
            <div className="font-bold text-lg mb-2">Budget vs Actual Spending</div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="category"
                  stroke="#ccc"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis stroke="#ccc" />
                <Tooltip content={CustomTooltip} />
                <Bar
                  dataKey="budget"
                  fill="#d1d5db"
                  radius={[8, 8, 0, 0]}
                  name="Budget"
                  activeBar={{ fill: "#52525b" }}
                />
                <Bar
                  dataKey="actual"
                  fill="#4287f5"
                  radius={[8, 8, 0, 0]}
                  name="Actual"
                  activeBar={{ fill: "#2563eb" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
