export async function fetchTransactions() {
  const response = await fetch('/api/transactions');
  return response.json();
}

export async function createTransaction(data: any) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateTransaction(id: string, data: any) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function fetchBudgets(month?: string) {
  const url = month ? `/api/budgets?month=${month}` : '/api/budgets';
  const response = await fetch(url);
  return response.json();
}

export async function setBudget(category: string, month: string, amount: number) {
  const response = await fetch('/api/budgets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category, month, amount }),
  });
  return response.json();
}
