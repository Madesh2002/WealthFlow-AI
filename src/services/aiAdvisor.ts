import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface FinancialData {
  monthlyIncome: number;
  targetSavings: number;
  totalSpent: number;
  budgets: { [category: string]: number };
  expenses: any[];
}

export async function getFinancialAdvisorInsight(data: FinancialData) {
  try {
    const totalSpent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetStatus = Object.entries(data.budgets).map(([cat, limit]) => {
      const spent = data.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
      return `${cat}: ₹${spent}/₹${limit}`;
    }).join(", ");

    const prompt = `
      You are a high-end AI Wealth Advisor. 
      Analyze this monthly data:
      - Income: ₹${data.monthlyIncome}
      - Target Savings: ₹${data.targetSavings}
      - Total Spent so far: ₹${totalSpent}
      - Budget limits vs current usage: ${budgetStatus}
      
      Please provide:
      1. A concise behavioral insight about the spending pattern.
      2. A specific "Safe-Spend" daily limit for the remaining month.
      3. Identify any anomalies. If found, specify the transaction description and the deviation percentage from the average (e.g. "35% above average").
      
      Keep it high-end, encouraging, and sharp. Return a JSON object with keys: 
      "insight" (string), 
      "safeSpend" (number), 
      "anomaly" (object | null) where anomaly is { "transaction": string, "deviation": string, "severity": "low" | "medium" | "high" }.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || '';
    // Attempt to parse JSON from Markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      insight: "Financial data analyzed. Stay disciplined.",
      safeSpend: Math.round((data.monthlyIncome - data.targetSavings - totalSpent) / 30),
      anomaly: null
    };
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw error;
  }
}

export async function parseTransactionSms(smsText: string) {
  try {
    const prompt = `
      You are a specialized financial parsing engine. 
      Extract transaction data from the following SMS or text snippets. 
      These are likely UPI or Bank notifications.
      
      Text: "${smsText}"
      
      Return a JSON array of objects with these keys for EACH transaction found:
      "amount" (number), "description" (string), "category" (Food, Transport, Shopping, Bills, or Other).
      
      If multiple transactions exist in the text, extract them all. If no transaction is found, return an empty array [].
      Always return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("SMS Parsing Error:", error);
    return [];
  }
}
