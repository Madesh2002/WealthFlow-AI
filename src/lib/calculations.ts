export const calculateSafeSpend = (income: number, target: number, spent: number) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Get days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  
  const remainingBudget = income - target - spent;
  const safeSpend = remainingBudget / daysLeft;
  
  return Math.max(0, Math.round(safeSpend * 100) / 100);
};

export const detectAnomaly = (expenses: any[]) => {
  if (expenses.length < 2) return null;
  const amounts = expenses.map(e => e.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const last = amounts[0];
  
  if (last > avg * 1.5) {
    return {
      deviation: Math.round(((last - avg) / avg) * 100) + "%",
      amount: last,
      avg: Math.round(avg)
    };
  }
  return null;
};
