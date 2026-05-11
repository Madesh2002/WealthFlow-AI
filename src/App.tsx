import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { FinanceService } from './services/financeService';
import { getFinancialAdvisorInsight, parseTransactionSms } from './services/aiAdvisor';
import { 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  UserCircle, 
  LogOut, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Download,
  AlertCircle,
  Brain,
  Calendar,
  FileDown,
  ChevronLeft,
  Menu,
  X,
  Zap,
  Check,
  Bell,
  Smartphone,
  Link2,
  ShieldCheck,
  Search,
  Mail,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWithinInterval, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { calculateSafeSpend, detectAnomaly } from './lib/calculations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const AuthPage = () => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, processing, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl min-h-[700px] overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-3/5 p-8 md:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black italic">Wealth<span className="text-indigo-600">Flow</span></span>
          </div>
          
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {isSignUp ? "Create Your Ledger." : "Elevate Your Capital."}
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              {isSignUp 
                ? "Join the network of disciplined wealth builders." 
                : "Connect your premium financial identity to activate the AI engine."}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-rose-600">{error}</p>
                    <button 
                      onClick={clearError}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-400 mt-2 hover:text-rose-600"
                    >
                      Dismiss Error
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            {isSignUp && (
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none font-medium text-slate-900 focus:bg-white focus:border-indigo-100 focus:shadow-xl focus:shadow-indigo-50 transition-all"
                />
              </div>
            )}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none font-medium text-slate-900 focus:bg-white focus:border-indigo-100 focus:shadow-xl focus:shadow-indigo-50 transition-all"
              />
            </div>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure Password"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none font-medium text-slate-900 focus:bg-white focus:border-indigo-100 focus:shadow-xl focus:shadow-indigo-50 transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-wide text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (isSignUp ? "Initialize Account" : "Access Intelligence Engine")}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-[0.2em]">OR SYNC IDENTITY</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={signInWithGoogle}
            disabled={processing}
            className="flex items-center justify-center gap-4 w-full py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale" alt="Google" />
            Continue with Identity Sync
          </button>

          <p className="mt-10 text-center text-sm font-medium text-slate-400">
            {isSignUp ? "Already secured?" : "New to WealthFlow?"}{" "}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
              }}
              className="text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:underline ml-1"
            >
              {isSignUp ? "Access Logic" : "Create Identity"}
            </button>
          </p>
        </div>

        <div className="hidden md:flex w-2/5 bg-slate-950 p-16 text-white flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Brain className="w-10 h-10 text-indigo-400 mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Precision Intelligence.</h2>
            <p className="text-slate-400 font-medium leading-relaxed text-lg">Predictive behavioral analysis for the modern wealth builder. Zero-trust security meets effortless tracking.</p>
          </div>
          
          <div className="relative z-10 space-y-6">
             <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex items-center gap-4">
               <div className="p-3 bg-indigo-500/20 rounded-2xl">
                 <ShieldCheck className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-0.5">Security Level</p>
                 <p className="text-lg font-medium">Zero-Trust Encrypted</p>
               </div>
             </div>
             <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex items-center gap-4">
               <div className="p-3 bg-indigo-500/20 rounded-2xl">
                 <Zap className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-0.5">Sync Velocity</p>
                 <p className="text-lg font-medium">Real-time Propagated</p>
               </div>
             </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'rules' | 'profile'>('dashboard');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<any>({ insight: "Syncing data...", safeSpend: 0, anomaly: null });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSmartSync, setShowSmartSync] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [linkedApps, setLinkedApps] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  const [exportStartDate, setExportStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [exportEndDate, setExportEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const addAlert = (message: string, severity: 'info' | 'error' | 'warning' | 'high' = 'info') => {
    const newAlert = {
      id: Date.now(),
      message,
      severity,
      timestamp: new Date().toLocaleTimeString()
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!user) return;
    const unsubExpenses = FinanceService.subscribeToExpenses(user.uid, setExpenses);
    const unsubBudgets = FinanceService.subscribeToBudgets(user.uid, setBudgets);
    const unsubGoals = FinanceService.subscribeToGoals(user.uid, setGoals);
    const unsubPrefs = FinanceService.subscribeToPreferences(user.uid, (prefs) => {
      setPushEnabled(prefs.pushEnabled || false);
      setEmailEnabled(prefs.emailEnabled || false);
      setLinkedApps(prefs.linkedApps || []);
    });

    return () => {
      unsubExpenses();
      unsubBudgets();
      unsubGoals();
      unsubPrefs();
    };
  }, [user]);

  useEffect(() => {
    if (goals) {
      refreshAiInsight();
    } else {
      setAiInsight({ insight: "Savings engine on standby. Set your goals to activate Safe-Spend intelligence.", safeSpend: 0, anomaly: null });
    }
  }, [expenses, goals, budgets]);

  const refreshAiInsight = async () => {
    if (!goals) return;
    setIsRefreshingAi(true);

    const currentMonthExpenses = expenses.filter(e => {
      const d = e.date?.toDate?.() || new Date();
      return isSameMonth(d, new Date());
    });
    
    const totalSpentThisMonth = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const budgetMap = budgets.reduce((acc, b) => ({ ...acc, [b.category]: b.amount }), {});
    
    // Deterministic Safe Spend
    const calculatedSafe = calculateSafeSpend(goals.monthlyIncome, goals.targetSavings, totalSpentThisMonth);
    
    // Deterministic Anomaly
    const localAnomaly = detectAnomaly(expenses);

    const insight = await getFinancialAdvisorInsight({
      monthlyIncome: goals.monthlyIncome,
      targetSavings: goals.targetSavings,
      totalSpent: totalSpentThisMonth,
      expenses: expenses.map(e => ({
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString()
      })),
      budgets: budgetMap
    });
    
    setAiInsight({
      ...insight,
      safeSpend: calculatedSafe, // Prioritize deterministic math
      localAnomaly
    });

    // Trigger Real-time Alert if anomaly detected
    if (localAnomaly || insight.anomaly) {
      const anomalySource = localAnomaly || insight.anomaly;
      const message = `Critical Deviation: ${anomalySource.transaction || 'Unusual spend'} is ${anomalySource.deviation}`;
      const severity = anomalySource.severity || 'high';
      
      const newAlert = {
        id: Date.now(),
        message,
        severity,
        timestamp: new Date().toLocaleTimeString()
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 5));

      // Persistent notification in DB
      FinanceService.addAlert({
        message,
        type: severity === 'high' ? 'error' : 'warning'
      });

      // Browser Push Notification
      if (pushEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("WealthFlow Guardrail Alert", {
          body: message,
          icon: "/favicon.ico"
        });
      }

      // Email Trigger Simulation
      if (emailEnabled) {
        console.log(`[Email Engine] Queued alert to ${user?.email}: ${message}`);
        // In a real app, this would trigger a cloud function or backend email service
      }
    }

    setIsRefreshingAi(false);
  };

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const chartData = [
    { name: 'Food', amount: expenses.filter(e => e.category === 'Food').reduce((s, e) => s + e.amount, 0) },
    { name: 'Transport', amount: expenses.filter(e => e.category === 'Transport').reduce((s, e) => s + e.amount, 0) },
    { name: 'Shop', amount: expenses.filter(e => e.category === 'Shopping').reduce((s, e) => s + e.amount, 0) },
    { name: 'Fun', amount: expenses.filter(e => e.category === 'Entertainment').reduce((s, e) => s + e.amount, 0) },
    { name: 'Bills', amount: expenses.filter(e => e.category === 'Bills').reduce((s, e) => s + e.amount, 0) },
    { name: 'Other', amount: expenses.filter(e => e.category === 'Other').reduce((s, e) => s + e.amount, 0) },
  ];

  const exportCSV = (filteredData?: any[]) => {
    const dataToExport = filteredData || expenses;
    const headers = ['Amount', 'Category', 'Description', 'Date'];
    const rows = dataToExport.map(e => [
      e.amount,
      e.category,
      e.description,
      e.date?.toDate?.().toISOString() || new Date().toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wealthflow_ledger_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredCSV = () => {
    const start = new Date(exportStartDate);
    const end = new Date(exportEndDate);
    const filtered = expenses.filter(e => {
      const d = e.date?.toDate?.() || new Date();
      return isWithinInterval(d, { start, end });
    });
    exportCSV(filtered);
  };

  const exportSummaryReport = () => {
    if (!goals) return;
    
    const start = new Date(exportStartDate);
    const end = new Date(exportEndDate);
    const filtered = expenses.filter(e => {
      const d = e.date?.toDate?.() || new Date();
      return isWithinInterval(d, { start, end });
    });

    const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);
    const savingsAchieved = Math.max(0, goals.monthlyIncome - totalSpent);

    const headers = ['Metric', 'Value'];
    const rows = [
      ['Report Period', `${exportStartDate} to ${exportEndDate}`],
      ['Total Income', goals.monthlyIncome],
      ['Target Savings', goals.targetSavings],
      ['Total Spent', totalSpent],
      ['Savings Achieved', savingsAchieved],
      ['Goal Met?', savingsAchieved >= goals.targetSavings ? 'YES' : 'NO'],
      ['', ''],
      ['Category Breakdown', ''],
      ...Object.entries(filtered.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as any)).map(([cat, amt]) => [cat, amt])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wealthflow_summary_${exportStartDate}_to_${exportEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Nav Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <TrendingUp className="text-white w-4 h-4" />
           </div>
           <span className="text-lg font-black tracking-tight">WealthFlow</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-3 bg-slate-50 rounded-xl text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-white transform transition-transform duration-500 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-indigo-600 w-6 h-6" />
              <span className="text-2xl font-black italic">WealthFlow</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
          <nav className="space-y-4 flex-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'rules', icon: ShieldAlert, label: 'AI Guardrails' },
              { id: 'profile', icon: UserCircle, label: 'Intelligence Sync' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all duration-300", 
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105" 
                    : "text-slate-500 hover:bg-slate-50 hover:translate-x-2"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-100 px-2">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-4 py-4 rounded-xl font-bold text-rose-500"
            >
              <LogOut className="w-5 h-5" />
              Logout Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Wealth<span className="text-indigo-600">Flow</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'rules', icon: ShieldAlert, label: 'AI Guardrails' },
            { id: 'profile', icon: UserCircle, label: 'Intelligence Sync' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:rotate-12", activeTab === item.id ? "text-white" : "text-slate-300 group-hover:text-slate-500")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-4 mb-4">
            <img src={user?.photoURL || ''} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <button 
                onClick={() => logout()}
                className="text-xs font-bold text-rose-500 uppercase tracking-wider hover:underline"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative mt-20 lg:mt-0 transition-all duration-500">
        {/* Real-time Alert Stack */}
        <div className="fixed top-8 right-8 z-[100] space-y-4 w-96 pointer-events-none">
          {alerts.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-auto flex justify-end"
            >
              <button 
                onClick={() => setAlerts([])}
                className="px-4 py-2 bg-slate-900/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-full hover:bg-slate-900/20 transition-all"
              >
                Clear All Notifications
              </button>
            </motion.div>
          )}
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className={cn(
                  "pointer-events-auto p-6 rounded-[2rem] shadow-2xl border-b-4 flex items-start gap-4 bg-white",
                  alert.severity === 'high' ? "border-rose-600" : "border-indigo-600"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl shrink-0",
                  alert.severity === 'high' ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Alert • {alert.timestamp}</p>
                    <button onClick={() => removeAlert(alert.id)} className="text-slate-300 hover:text-slate-600">
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Portfolio Flow</h2>
                  <p className="text-slate-500 font-medium text-lg">Operational intelligence for the current cycle.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowSmartSync(true)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <Zap className="w-5 h-5 text-indigo-400" />
                    Smart Sync
                  </button>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    New Entry
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* AI Card */}
                <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8">
                    <Brain className={cn("w-12 h-12 text-indigo-400 opacity-20", isRefreshingAi && "animate-pulse")} />
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">Predictive Modeling</span>
                    <h3 className="text-4xl font-extrabold tracking-tight mt-6 mb-8">₹{aiInsight.safeSpend}<span className="text-xl font-medium opacity-40 ml-2">/ Day Safe Spend</span></h3>
                    
                    {!goals ? (
                      <div className="space-y-4">
                        <p className="text-lg font-medium text-slate-400 leading-relaxed italic">"Savings engine on standby. Set your goals to activate Safe-Spend intelligence."</p>
                        <button 
                          onClick={() => setActiveTab('rules')}
                          className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-lg"
                        >
                          Configure Engine
                        </button>
                      </div>
                    ) : (
                      <p className="text-lg font-medium text-slate-400 leading-relaxed italic">"{aiInsight.insight}"</p>
                    )}

                    {aiInsight.localAnomaly && (
                      <div className="mt-8 flex items-center gap-3 font-bold w-fit px-4 py-2 rounded-xl border text-rose-400 bg-rose-400/10 border-rose-400/20">
                        <AlertCircle className="w-5 h-5" />
                        Anomaly: ₹{aiInsight.localAnomaly.amount} is {aiInsight.localAnomaly.deviation} above average
                      </div>
                    )}
                    {aiInsight.anomaly && !aiInsight.localAnomaly && (
                      <div className={cn(
                        "mt-8 flex items-center gap-3 font-bold w-fit px-4 py-2 rounded-xl border",
                        aiInsight.anomaly.severity === 'high' 
                          ? "text-rose-400 bg-rose-400/10 border-rose-400/20" 
                          : "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                      )}>
                        <AlertCircle className="w-5 h-5" />
                        AI Flag: {aiInsight.anomaly.transaction} ({aiInsight.anomaly.deviation})
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
                </div>

                {/* Chart Card */}
                <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <h4 className="font-bold text-slate-800 mb-8 uppercase text-xs tracking-widest text-slate-400">Structural Allocation</h4>
                  <div className="h-64 mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <Bar 
                          dataKey="amount" 
                          fill="#4f46e5" 
                          radius={[12, 12, 12, 12]}
                          background={{ fill: '#f1f5f9', radius: 12 }}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#4f46e5' : '#e2e8f0'} />
                          ))}
                        </Bar>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Savings Engine Card */}
                <div className="lg:col-span-12 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-full md:w-80 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0 group-hover:rotate-1 transition-transform">
                      <img 
                        src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2942&auto=format&fit=crop" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-90 contrast-110"
                        alt="Wealth Growth"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Savings Propulsion Engine</span>
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">Active Capital Accumulation</h4>
                          <p className="text-slate-500 font-medium mt-1">Your liquidity thrust is optimized for maximum compounding potential.</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Thrust Efficiency</p>
                          <p className="text-3xl font-extrabold text-indigo-600">
                            {((Math.max(0, (goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) / (goals?.targetSavings || 1)) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (Math.max(0, (goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) / (goals?.targetSavings || 1)) * 100)}%` }}
                            className={cn(
                              "h-full transition-all duration-1000 rounded-full",
                              ((goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "bg-indigo-600" : "bg-rose-500"
                            )}
                          />
                        </div>
                                           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Balance</p>
                             <p className="font-extrabold text-2xl text-slate-900">₹{Math.max(0, (goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)).toFixed(0)}</p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Month Target</p>
                             <p className="font-extrabold text-2xl text-slate-900">₹{goals?.targetSavings || 0}</p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Safe Runway</p>
                             <p className="font-extrabold text-2xl text-slate-900">₹{aiInsight.safeSpend * 5}</p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Engine Status</p>
                             <div className="flex items-center gap-2">
                               <div className={cn("w-2 h-2 rounded-full", ((goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                               <p className={cn("font-extrabold text-[10px] uppercase tracking-wider", ((goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "text-emerald-500" : "text-rose-500")}>
                                  {((goals?.monthlyIncome || 0) - expenses.filter(e => isSameMonth(e.date?.toDate?.() || new Date(), new Date())).reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "Optimal" : "Check Flow"}
                               </p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick History */}
                <div className="lg:col-span-12 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm overflow-hidden">
                   <div className="flex justify-between items-center mb-8">
                    <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest text-slate-400">Recent Capital Activity</h4>
                    <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-indigo-600 hover:underline">View All History →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {expenses.slice(0, 5).map(e => (
                          <tr key={e.id} className="group">
                            <td className="py-4 font-bold text-slate-700">{e.description}</td>
                            <td className="py-4">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">{e.category}</span>
                            </td>
                            <td className="py-4 text-right font-bold text-lg">₹{e.amount}</td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-400 italic">No entries detected in this cycle.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="p-3 bg-white border border-slate-100 rounded-2xl hover:scale-105 transition-all shadow-sm group"
                  >
                    <ChevronLeft className="w-6 h-6 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Historical Audit</h2>
                    <p className="text-slate-400 font-medium text-lg">Transparent ledger of all capital shifts.</p>
                  </div>
                </div>
                
                <div className="relative w-full md:w-80 group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-14 pr-12 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-medium text-slate-600 focus:border-indigo-100 focus:shadow-lg focus:shadow-indigo-50 transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  {selectedExpenses.length > 0 && (
                    <button 
                      onClick={async () => {
                        if (confirm(`Purge ${selectedExpenses.length} selected entries?`)) {
                          setBulkProcessing(true);
                          for (const id of selectedExpenses) {
                            await FinanceService.deleteExpense(id);
                          }
                          setSelectedExpenses([]);
                          setBulkProcessing(false);
                          addAlert(`Bulk purge complete: ${selectedExpenses.length} entries removed.`, 'info');
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-5 h-5" />
                      Clear {selectedExpenses.length} Selected
                    </button>
                  )}
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    <FileDown className="w-5 h-5" />
                    Advanced Export
                  </button>
                  <button 
                    onClick={() => exportCSV()}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Quick Save
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-10 py-6 w-10">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExpenses(expenses.map(exp => exp.id));
                            } else {
                              setSelectedExpenses([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-10 py-6 text-xs font-bold uppercase text-slate-400 tracking-wider">Entry Detail</th>
                      <th className="px-10 py-6 text-xs font-bold uppercase text-slate-400 tracking-wider">Category</th>
                      <th className="px-10 py-6 text-xs font-bold uppercase text-slate-400 tracking-wider text-right">Volume</th>
                      <th className="px-10 py-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses
                      .filter(e => 
                        e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        e.category.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((expense) => (
                      <tr key={expense.id} className={cn("hover:bg-slate-50/30 transition-colors", selectedExpenses.includes(expense.id) && "bg-indigo-50/50")}>
                        <td className="px-10 py-6">
                          <input 
                            type="checkbox"
                            className="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500"
                            checked={selectedExpenses.includes(expense.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExpenses(prev => [...prev, expense.id]);
                              } else {
                                setSelectedExpenses(prev => prev.filter(id => id !== expense.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-10 py-6">
                          <p className="font-bold text-slate-800">{expense.description}</p>
                          <p className="text-xs text-slate-400 font-medium">{new Date(expense.date?.seconds * 1000).toLocaleDateString()}</p>
                        </td>
                        <td className="px-10 py-6">
                           <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right font-bold text-slate-900 text-lg">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => FinanceService.deleteExpense(expense.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div 
              key="rules"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="p-3 bg-white border border-slate-100 rounded-2xl hover:scale-105 transition-all shadow-sm group"
                >
                  <ChevronLeft className="w-6 h-6 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">AI Guardrail Engine</h2>
                  <p className="text-slate-400 font-medium">Systemic constraints and behavioral targets.</p>
                </div>
              </div>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                  <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm border-l-4 border-l-indigo-600 hover:shadow-xl transition-all duration-500 group">
                    <h4 className="text-xl font-bold text-indigo-600 mb-2 transition-transform group-hover:translate-x-1">Savings Engine</h4>
                    <p className="text-slate-400 text-sm font-medium mb-8">Define income and targets for behavioral analysis.</p>
                    <form 
                      key={goals?.id || 'new'}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        await FinanceService.updateGoals(
                          Number(formData.get('income')),
                          Number(formData.get('target'))
                        );
                      }}
                      className="space-y-4"
                    >
                      <div className="relative group/input">
                        <input 
                          name="income" 
                          type="number" 
                          defaultValue={goals?.monthlyIncome}
                          placeholder="Monthly Inflow (₹)" 
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none font-bold focus:bg-white focus:border-indigo-100 transition-all" 
                        />
                      </div>
                      <div className="relative group/input">
                        <input 
                          name="target" 
                          type="number" 
                          defaultValue={goals?.targetSavings}
                          placeholder="Savings Target (₹)" 
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none font-bold focus:bg-white focus:border-indigo-100 transition-all" 
                        />
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-[3] py-4 bg-indigo-600 text-white rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
                          Update Matrix
                        </button>
                        <button 
                          type="reset"
                          className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-3xl font-bold hover:bg-slate-100 transition-all text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm border-l-4 border-l-rose-500 hover:shadow-xl transition-all duration-500 group">
                    <h4 className="text-xl font-bold text-rose-500 mb-2 transition-transform group-hover:translate-x-1">Category Guard</h4>
                    <p className="text-slate-400 text-sm font-medium mb-8">Implement monthly spending caps for specific zones.</p>
                    <form 
                       onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        FinanceService.updateBudget(
                          formData.get('category') as string,
                          Number(formData.get('amount'))
                        );
                      }}
                      className="space-y-4"
                    >
                      <select name="category" className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold appearance-none cursor-pointer border-2 border-transparent focus:bg-white focus:border-rose-100 transition-all">
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Bills</option>
                        <option>Other</option>
                      </select>
                      <div className="relative">
                        <input 
                          name="amount" 
                          type="number" 
                          placeholder="Monthly Constraint (₹)" 
                          className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-3xl outline-none font-bold focus:bg-white focus:border-rose-100 transition-all" 
                        />
                      </div>
                      <div className="flex gap-4">
                        <button className="flex-[3] py-4 bg-slate-900 text-white rounded-3xl font-bold uppercase text-xs tracking-widest hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-95">
                          Deploy Guardrail
                        </button>
                        <button 
                          type="reset"
                          className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-3xl font-bold hover:bg-slate-100 transition-all text-xs"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-10 py-6 bg-slate-50/50 border-b">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Operational Constraints</h4>
                </div>
                <div className="p-10 space-y-8">
                  {budgets.map((b) => {
                    const spent = expenses
                      .filter(e => e.category === b.category && isSameMonth(e.date?.toDate?.() || new Date(), new Date()))
                      .reduce((s, e) => s + e.amount, 0);
                    const percent = Math.min(100, (spent / b.amount) * 100);

                    return (
                      <div key={b.id} className="group relative">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-slate-900">{b.category}</p>
                            <p className="text-xs text-slate-400 font-medium">Monthly Guardrail Activity</p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-right">
                              <p className="font-bold text-slate-900">₹{spent.toFixed(0)} <span className="text-slate-300 mx-1">/</span> ₹{b.amount.toFixed(0)}</p>
                              <p className={cn("text-xs font-bold uppercase tracking-wider", percent > 90 ? "text-rose-500" : "text-indigo-500")}>
                                {percent.toFixed(0)}% Exhausted
                              </p>
                            </div>
                            <button 
                              onClick={() => FinanceService.deleteBudget(b.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Guardrail"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            className={cn("h-full rounded-full transition-all", percent > 90 ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "bg-indigo-600")}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {budgets.length === 0 && (
                    <div className="py-12 text-center">
                      <ShieldAlert className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium italic">No active guardrails deployed. Set a category limit to begin monitoring.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="p-3 bg-white border border-slate-100 rounded-2xl hover:scale-105 transition-all shadow-sm group"
                >
                  <ChevronLeft className="w-6 h-6 text-indigo-600 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Intelligence Identity</h2>
                  <p className="text-slate-400 font-medium">Synchronized core profile and security parameters.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Overview */}
                <div className="lg:col-span-12 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
                  <div className="relative group">
                    <img src={user?.photoURL || ''} className="w-40 h-40 rounded-full border-8 border-indigo-50 shadow-2xl transition-transform group-hover:scale-105" alt="Profile" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-full border-4 border-white shadow-lg">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1 space-y-2">
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.displayName}</h3>
                    <p className="text-lg text-slate-400 font-medium">{user?.email}</p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <span className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border border-indigo-100">Verified Elite Tier</span>
                      <span className="bg-slate-50 text-slate-400 px-6 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border border-slate-100">Core ID: {user?.uid.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                {/* Account Details & Security */}
                <div className="lg:col-span-7 bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm space-y-12">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">Metadata Analysis</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-[2.5rem]">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Member Since</p>
                        <p className="font-bold text-slate-800">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Analysis incomplete'}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2.5rem]">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1">Last Synchronization</p>
                        <p className="font-bold text-slate-800">{user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">Security & Alerts</h4>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] hover:bg-slate-100 transition-colors group/item">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-2xl transition-all duration-300 group-hover/item:scale-110", pushEnabled ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-200")}>
                              <Zap className={cn("w-6 h-6", pushEnabled ? "text-white" : "text-slate-400")} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-lg">Real-time AI Alerts</p>
                              <p className="text-sm text-slate-400 font-medium">Browser push notifications for anomalies.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const nextVal = !pushEnabled;
                              if (nextVal) {
                                Notification.requestPermission().then(permission => {
                                  if (permission === "granted") {
                                    setPushEnabled(true);
                                    FinanceService.updatePreferences({ pushEnabled: true });
                                  }
                                });
                              } else {
                                setPushEnabled(false);
                                FinanceService.updatePreferences({ pushEnabled: false });
                              }
                            }}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all duration-300 relative",
                              pushEnabled ? "bg-indigo-600" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              pushEnabled ? "left-7" : "left-1"
                            )} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] hover:bg-slate-100 transition-colors group/item">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-2xl transition-all duration-300 group-hover/item:scale-110", emailEnabled ? "bg-indigo-600 shadow-lg shadow-indigo-200" : "bg-slate-200")}>
                              <Bell className={cn("w-6 h-6", emailEnabled ? "text-white" : "text-slate-400")} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">Email Intelligence</p>
                              <p className="text-xs text-slate-400 font-medium font-mono uppercase tracking-tighter">Connected Account: {user?.email?.split('@')[0]}...</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const nextVal = !emailEnabled;
                              setEmailEnabled(nextVal);
                              FinanceService.updatePreferences({ emailEnabled: nextVal });
                            }}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all duration-300 relative",
                              emailEnabled ? "bg-indigo-600" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              emailEnabled ? "left-7" : "left-1"
                            )} />
                          </button>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">Linked Ecosystems</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        {[
                          { id: 'phonepe', name: 'PhonePe', color: 'bg-[#5f259f]', iconColor: 'text-white' },
                          { id: 'gpay', name: 'Google Pay', color: 'bg-white', iconColor: 'text-blue-600', border: 'border-2 border-slate-100' }
                        ].map(app => (
                          <div 
                            key={app.id}
                            className={cn(
                              "p-6 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group",
                              app.color, app.border,
                              linkedApps.includes(app.id) ? "ring-4 ring-indigo-600/20" : ""
                            )}
                          >
                            {linkedApps.includes(app.id) && (
                              <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full animate-bounce">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", linkedApps.includes(app.id) ? "bg-white" : "bg-slate-50")}>
                               <Smartphone className={cn("w-8 h-8", app.iconColor)} />
                            </div>
                            <div className="text-center">
                              <p className={cn("font-bold text-lg", app.id === 'phonepe' ? "text-white" : "text-slate-900")}>{app.name}</p>
                              <p className={cn("text-xs font-bold uppercase tracking-wider", app.id === 'phonepe' ? "text-white/60" : "text-slate-400")}>
                                {linkedApps.includes(app.id) ? 'Active Sync' : 'Not Linked'}
                              </p>
                            </div>
                            <button 
                              onClick={() => {
                                const nextApps = linkedApps.includes(app.id) 
                                  ? linkedApps.filter(id => id !== app.id)
                                  : [...linkedApps, app.id];
                                setLinkedApps(nextApps);
                                FinanceService.updatePreferences({ linkedApps: nextApps });
                              }}
                              className={cn(
                                "w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                                linkedApps.includes(app.id) 
                                  ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm" 
                                  : "bg-slate-900 text-white hover:bg-slate-800"
                              )}
                            >
                              {linkedApps.includes(app.id) ? 'De-Link' : 'Link Account'}
                            </button>
                          </div>
                        ))}
                     </div>

                     <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                           <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-2xl relative group-hover:rotate-1 transition-transform">
                              <img 
                                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
                                className="w-full h-full object-cover grayscale brightness-50 contrast-125 group-hover:scale-110 transition-transform duration-700" 
                                alt="Savings Engine" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-indigo-500/20 flex flex-col justify-end p-6">
                                 <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-300">Engine Operational</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                 <Zap className="w-6 h-6 text-indigo-400" />
                                 <h4 className="text-2xl font-black tracking-tight">Savings Propulsion Engine</h4>
                              </div>
                              <p className="text-slate-400 font-medium mb-8 leading-relaxed">Your capital is being intelligently routed based on your behavioral patterns. The engine prioritizes liquidity while maintaining a zero-trust guardrail on discretionary outflows.</p>
                              
                              <div className="grid grid-cols-2 gap-8 mb-8">
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Velocity</p>
                                    <p className="text-3xl font-black text-white">₹{goals?.targetSavings || 0}<span className="text-xs text-slate-500 ml-2">/mo</span></p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Actual Flow</p>
                                    <p className={cn("text-3xl font-black", (goals?.monthlyIncome - expenses.reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "text-indigo-400" : "text-rose-400")}>
                                      ₹{Math.max(0, (goals?.monthlyIncome || 0) - expenses.reduce((s,e) => s+e.amount, 0)).toFixed(0)}
                                    </p>
                                 </div>
                              </div>

                              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (Math.max(0, (goals?.monthlyIncome || 0) - expenses.reduce((s,e) => s+e.amount, 0)) / (goals?.targetSavings || 1)) * 100)}%` }}
                                    className={cn("h-full transition-all duration-1000", (goals?.monthlyIncome - expenses.reduce((s,e) => s+e.amount, 0)) >= (goals?.targetSavings || 0) ? "bg-indigo-500" : "bg-rose-500")}
                                 />
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Thrust Efficiency: {((Math.max(0, (goals?.monthlyIncome || 0) - expenses.reduce((s,e) => s+e.amount, 0)) / (goals?.targetSavings || 1)) * 100).toFixed(0)}%</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Session Actions */}
                <div className="lg:col-span-5 space-y-8">
                  <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="font-black text-2xl mb-4 leading-tight">Session Termination Protocol</h4>
                      <p className="text-slate-400 font-medium text-sm mb-12">Safely disconnect your financial identity from the current compute cycle. All local caches will be purged.</p>
                      <button 
                        onClick={() => logout()}
                        className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-rose-900/40 transition-all active:scale-95"
                      >
                        Secure Logout
                      </button>
                    </div>
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full" />
                  </div>

                  <div className="bg-rose-50/30 rounded-[3rem] p-10 border border-rose-100/50">
                    <div className="flex items-center gap-3 mb-6">
                      <ShieldCheck className="w-5 h-5 text-rose-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400">Security / Danger Zone</h4>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-2">Purge Ledger Matrix</p>
                      <p className="text-sm text-slate-400 font-medium mb-8">Irreversibly wipe all transaction history and guardrail configurations.</p>
                      
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={async () => {
                            try {
                              setBulkProcessing(true);
                              await FinanceService.resetAllData();
                              addAlert("Full system purge initialized. All ledgers have been wiped.", 'high');
                            } catch (e) {
                              addAlert("Purge sequence failed. Check system logs.", 'high');
                            } finally {
                              setBulkProcessing(false);
                            }
                          }}
                          disabled={bulkProcessing}
                          className="w-full py-5 bg-white text-rose-500 border-2 border-rose-100 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {bulkProcessing ? (
                            <div className="w-5 h-5 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                          ) : <Trash2 className="w-4 h-4" />}
                          {bulkProcessing ? "Purging Matrix..." : "Initialize Full Wipe"}
                        </button>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter text-center">Caution: This action is immediate and non-recoverable.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">WealthFlow Intelligence Core v4.1</p>
                    <div className="flex justify-center gap-6">
                      <button className="text-slate-400 hover:text-indigo-500 text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy Charter</button>
                      <button className="text-slate-400 hover:text-indigo-500 text-[10px] font-bold uppercase tracking-widest transition-colors">System Health</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Smart Sync Modal */}
      <AnimatePresence>
        {showSmartSync && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                 if (!bulkProcessing) {
                   setShowSmartSync(false);
                   setParsedItems([]);
                 }
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-600 p-4 rounded-3xl">
                  <Zap className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">AI Smart Sync</h3>
                  <p className="text-slate-400 font-medium">Paste your UPI or Bank SMS/notifications to auto-import.</p>
                </div>
              </div>

              {parsedItems.length === 0 ? (
                <div className="space-y-6">
                  <div className="relative">
                    <textarea 
                      id="sms-input"
                      className="w-full h-48 p-8 bg-slate-50 rounded-[2rem] outline-none font-medium text-slate-600 placeholder:text-slate-300 resize-none border-2 border-transparent focus:bg-white focus:border-indigo-100 transition-all"
                      placeholder="Example: HDFC Bank: ₹50.0 paid to ZOMATO via UPI at 12:45 PM..."
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('sms-input') as HTMLTextAreaElement;
                        if (el) el.value = '';
                      }}
                      className="absolute top-6 right-6 p-2 bg-white rounded-xl shadow-sm text-slate-300 hover:text-slate-500 hover:scale-110 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      disabled={bulkProcessing}
                      onClick={async () => {
                        const text = (document.getElementById('sms-input') as HTMLTextAreaElement).value;
                        if (!text) return;
                        setBulkProcessing(true);
                        const items = await parseTransactionSms(text);
                        setParsedItems(items);
                        setBulkProcessing(false);
                      }}
                      className="flex-[3] py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {bulkProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <Brain className="w-5 h-5" />}
                      {bulkProcessing ? "Parsing..." : "Deconstruct Text"}
                    </button>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('sms-input') as HTMLTextAreaElement;
                        if (el) el.value = '';
                      }}
                      className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-bold hover:bg-slate-100 transition-all text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-4 no-scrollbar">
                    {parsedItems.map((item, idx) => (
                      <div key={idx} className="group relative flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{item.description}</p>
                          <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-black text-slate-900">₹{item.amount}</p>
                          <button 
                            onClick={() => {
                              const next = [...parsedItems];
                              next.splice(idx, 1);
                              setParsedItems(next);
                            }}
                            className="p-2 bg-white rounded-xl shadow-sm text-rose-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:scale-110 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setParsedItems([])}
                      className="flex-1 py-5 border border-slate-100 rounded-[2rem] font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                    >
                      Clear & Redo
                    </button>
                    <button 
                      onClick={async () => {
                        setBulkProcessing(true);
                        for (const item of parsedItems) {
                          await FinanceService.addExpense(item);
                        }
                        setBulkProcessing(false);
                        setParsedItems([]);
                        setShowSmartSync(false);
                      }}
                      className="flex-3 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                    >
                      <Check className="w-5 h-5" />
                      Commit {parsedItems.length} Entries
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Entry Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl"
            >
              <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-2">New Portfolio Flow</h3>
              <p className="text-slate-400 font-medium mb-10">Record a single-cycle transaction event.</p>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await FinanceService.addExpense({
                    amount: Number(formData.get('amount')),
                    category: formData.get('category'),
                    description: formData.get('description'),
                  });
                  setShowAddForm(false);
                }}
                className="space-y-6"
              >
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 mb-2 block">Volume (₹)</label>
                  <input name="amount" type="number" step="0.01" required className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold text-2xl" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 mb-2 block">Structural Cluster</label>
                  <select name="category" className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-bold appearance-none">
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 mb-2 block">Event Description</label>
                  <input name="description" required className="w-full px-8 py-5 bg-slate-50 rounded-3xl outline-none font-medium" placeholder="Where did the capital shift?" />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="submit"
                    className="flex-[3] py-5 bg-indigo-600 text-white rounded-[2rem] font-bold uppercase tracking-wider shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Commit To Ledger
                  </button>
                  <button 
                    type="reset"
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-bold hover:bg-slate-100 transition-all text-sm"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-indigo-600 p-3 rounded-2xl">
                  <FileDown className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900 leading-none">Advanced Export</h3>
                  <p className="text-slate-400 font-medium mt-1">Configure your financial report output.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 mb-2 block">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="date" 
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full pl-14 pr-8 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-2 mb-2 block">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="date" 
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full pl-14 pr-8 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={exportFilteredCSV}
                    className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-slate-100 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Filtered Ledger (CSV)</p>
                      <p className="text-xs text-slate-400">Detailed transaction list for the selected range.</p>
                    </div>
                    <Download className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={exportSummaryReport}
                    className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] hover:bg-slate-800 transition-colors group text-white"
                  >
                    <div className="text-left">
                      <p className="font-bold">Summary Insights (CSV)</p>
                      <p className="text-xs opacity-50">High-level capital performance and savings audit.</p>
                    </div>
                    <Brain className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-[0.2em]">Zero-Trust Secure Export Protocol Enabled</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <TrendingUp className="w-12 h-12 text-indigo-500 animate-bounce" />
        <p className="text-white/50 font-black uppercase tracking-widest text-xs">Initializing Flow Engine</p>
      </div>
    </div>
  );

  return user ? <Dashboard /> : <AuthPage />;
}
