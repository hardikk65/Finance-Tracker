"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Calendar, CreditCard, TrendingUp } from "lucide-react";
import type { TooltipProps } from 'recharts';
import { fetchTransactions, fetchBudgets, setBudget } from '@/lib/api';
import { Button } from "@/components/ui/button";

// Example data
const monthlyExpenses = [
  { month: "May 2025", amount: 1950 },
  { month: "Jun 2025", amount: 1450 },
  { month: "Jul 2025", amount: 1600 },
];

const categoryData = [
  { name: "Shopping", value: 30, color: "#4287f5" },
  { name: "Bills & Utilities", value: 22, color: "#f54242" },
  { name: "Healthcare", value: 19, color: "#42f5b3" },
  { name: "Groceries", value: 17, color: "#f5a142" },
  { name: "Transportation", value: 6, color: "#a142f5" },
  { name: "Food & Dining", value: 3, color: "#f542a7" },
  { name: "Other", value: 2, color: "#b3b3b3" },
  { name: "Home & Garden", value: 1, color: "#b3f542" },
];

// Add example data for Budget vs Actual Spending
const budgetVsActualData = [
  { category: "Food & Dining", budget: 800, actual: 650 },
  { category: "Transportation", budget: 300, actual: 250 },
  { category: "Shopping", budget: 400, actual: 380 },
  { category: "Entertainment", budget: 200, actual: 180 },
  { category: "Bills & Utilities", budget: 500, actual: 450 },
  { category: "Healthcare", budget: 200, actual: 190 },
  { category: "Travel", budget: 300, actual: 220 },
  { category: "Education", budget: 150, actual: 120 },
  { category: "Groceries", budget: 600, actual: 580 },
  { category: "Home & Garden", budget: 250, actual: 200 },
  { category: "Other", budget: 200, actual: 150 },
];

// Add this type definition at the top of your file, after imports
type Transaction = {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 text-white rounded-md px-4 py-2 shadow">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Add these helper functions before processTransactionsForCharts
function groupByMonth(transactions: any[]) {
  // Group transactions by month and sum amounts
  const monthlyMap = new Map();
  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + tx.amount);
  });
  return Array.from(monthlyMap.entries()).map(([month, amount]) => ({ month, amount }));
}

function groupByCategory(transactions: any[]) {
  // Group transactions by category and calculate percentages
  const categoryMap = new Map();
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  transactions.forEach(tx => {
    categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
  });
  
  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: Math.round((value as number / total) * 100),
    color: getCategoryColor(name)
  }));
}

function calculateBudgetVsActual(transactions: any[]) {
  // For now, return mock budget data
  return budgetVsActualData;
}

function getCategoryColor(category: string) {
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
}

// Helper functions to process transaction data
function processTransactionsForCharts(transactions: any[]) {
  // Group by month for bar chart
  const monthlyData = groupByMonth(transactions);
  
  // Group by category for pie chart
  const categoryData = groupByCategory(transactions);
  
  // Calculate budget vs actual
  const budgetData = calculateBudgetVsActual(transactions);
  
  return { monthlyData, categoryData, budgetData };
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [budgetInputs, setBudgetInputs] = useState<{ [category: string]: string }>({});
  const [budgetMonth, setBudgetMonth] = useState(() => {
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
        setBudgets(data);
        // Set initial input values
        const inputObj: { [category: string]: string } = {};
        data.forEach((b: any) => {
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

  // Recent transactions (sorted by date desc)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Simple spending insight
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

  // Helper: get budget for a category
  function getBudgetForCategory(category: string) {
    const found = budgets.find((b) => b.category === category);
    return found ? found.amount : 0;
  }

  // Build budget vs actual data for chart
  const budgetData = Object.keys(budgetInputs).length > 0
    ? Object.keys(budgetInputs).map((category) => {
        const actual = transactions
          .filter((tx) => tx.category === category)
          .reduce((sum, tx) => sum + tx.amount, 0);
        return {
          category,
          budget: Number(budgetInputs[category]) || 0,
          actual,
        };
      })
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Budget setting UI
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

  async function handleBudgetChange(category: string, value: string) {
    setBudgetInputs((prev) => ({ ...prev, [category]: value }));
  }

  async function handleBudgetSave(category: string) {
    setBudgetLoading(true);
    try {
      await setBudget(category, budgetMonth, Number(budgetInputs[category]));
      const data = await fetchBudgets(budgetMonth);
      setBudgets(data);
    } catch (error) {
      console.error('Failed to save budget:', error);
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
                          <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-xs">{tx.category}</span>
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
                  <label className="text-sm mb-1">{category}</label>
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
                    <Button
                      size="sm"
                      className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
                      onClick={() => handleBudgetSave(category)}
                      disabled={budgetLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
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
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm">{entry.name}</span>
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
