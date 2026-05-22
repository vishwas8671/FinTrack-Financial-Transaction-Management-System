export const generateFinancialInsights = (transactions, budgets, savingsGoals) => {
  // 1. Core aggregates
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpending = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

  // 2. Financial Score calculation (0 to 100 scale)
  // High savings ratio = higher score. Low expense = higher score.
  let financialScore = 50; // base score
  if (totalIncome > 0) {
    const savingsRatio = (netSavings / totalIncome) * 100;
    if (savingsRatio > 30) financialScore += 25;
    else if (savingsRatio > 10) financialScore += 15;
    else if (savingsRatio < 0) financialScore -= 20;

    if (expenseRatio < 50) financialScore += 25;
    else if (expenseRatio < 80) financialScore += 10;
    else if (expenseRatio > 100) financialScore -= 15;
  }
  
  // Budget breach penalty
  let overspentCategoriesCount = 0;
  budgets.forEach((b) => {
    const spent = categorySpending[b.category] || 0;
    if (spent > b.limitAmount) {
      overspentCategoriesCount++;
    }
  });
  financialScore -= (overspentCategoriesCount * 8);
  financialScore = Math.max(10, Math.min(100, financialScore));

  // 3. Category analysis & top expense
  let topCategory = 'None';
  let topCategoryAmount = 0;
  Object.keys(categorySpending).forEach((cat) => {
    if (categorySpending[cat] > topCategoryAmount) {
      topCategoryAmount = categorySpending[cat];
      topCategory = cat;
    }
  });

  // 4. Generate AI Recommendations & Insights
  const recommendations = [];
  const insights = [];

  // Monthly summary statement
  const healthStatus = financialScore >= 80 
    ? 'Excellent' 
    : financialScore >= 65 
    ? 'Healthy' 
    : financialScore >= 50 
    ? 'Average' 
    : 'Needs Attention';

  const summaryText = `Based on your recent transactions, your financial health is evaluated as **${healthStatus}** (Score: **${financialScore}/100**). You have generated **$${totalIncome.toFixed(2)}** in income and spent **$${totalExpense.toFixed(2)}** in expenses, resulting in a net cash flow of **$${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}**.`;

  // Specific Insights based on data
  if (totalIncome > 0 && expenseRatio > 90) {
    insights.push(`Your expenses consume **${expenseRatio.toFixed(1)}%** of your total monthly income. This is high and leaves you vulnerable to unexpected financial spikes.`);
    recommendations.push('Create a stricter "Emergency Fund" and target cutting discretionary categories (Shopping, Entertainment) by 25%.');
  } else if (totalIncome > 0 && expenseRatio < 50) {
    insights.push(`Superb spending control! You are saving **${(100 - expenseRatio).toFixed(1)}%** of your income.`);
    recommendations.push('Consider moving your surplus cash flow into yield-generating "Investments" or boosting active savings goals.');
  } else {
    insights.push(`Your spending-to-income ratio is in a moderate range of **${expenseRatio.toFixed(1)}%**.`);
    recommendations.push('Try automating a 15% monthly transfer to your savings goals right after you receive your salary.');
  }

  if (topCategoryAmount > 0) {
    const topPct = totalExpense > 0 ? (topCategoryAmount / totalExpense) * 100 : 0;
    insights.push(`**${topCategory}** is your highest expense, taking up **$${topCategoryAmount.toFixed(2)}** (**${topPct.toFixed(1)}%** of total expenses).`);
    
    if (topCategory === 'Food' || topCategory === 'Shopping' || topCategory === 'Entertainment') {
      recommendations.push(`Review transaction records in the **${topCategory}** category. Opting for cheaper alternatives or home cooking could save you up to $${(topCategoryAmount * 0.15).toFixed(0)} per month.`);
    }
  }

  if (overspentCategoriesCount > 0) {
    insights.push(`You have exceeded your monthly budget limits in **${overspentCategoriesCount}** spending categories.`);
    recommendations.push('Go to the Budgets panel and set more realistic limits, or turn on active notifications to warn you when category spending crosses 80%.');
  }

  if (savingsGoals.length === 0) {
    recommendations.push('You do not have any active Savings Goals. Establishing clear milestones (like an Emergency fund or major purchase target) helps reinforce smart budgeting.');
  } else {
    savingsGoals.forEach(g => {
      const completionPct = (g.currentAmount / g.targetAmount) * 100;
      if (completionPct < 25) {
        recommendations.push(`Your goal **"${g.name}"** is currently at ${completionPct.toFixed(1)}% completion. Adding just $10 a week could accelerate target completion significantly.`);
      } else if (completionPct >= 100) {
        insights.push(`Congratulations! You achieved your savings goal: **"${g.name}"**.`);
      }
    });
  }

  // Fallbacks if lists are empty
  if (insights.length === 0) {
    insights.push('We need a bit more transaction history to identify distinct spending patterns. Try logging a few more expenses.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Review your budget configurations weekly to ensure your spending habits align with your wealth goals.');
  }

  return {
    score: financialScore,
    summary: summaryText,
    insights,
    recommendations,
    statistics: {
      income: totalIncome,
      expense: totalExpense,
      net: netSavings,
      expenseRatio
    }
  };
};
