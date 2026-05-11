import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FinanceService = {
  subscribeToExpenses: (userId: string, callback: (expenses: any[]) => void) => {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'));
  },

  subscribeToBudgets: (userId: string, callback: (budgets: any[]) => void) => {
    const q = query(collection(db, 'budgets'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'budgets'));
  },

  subscribeToGoals: (userId: string, callback: (goals: any | null) => void) => {
    const q = query(collection(db, 'savingsGoals'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        callback(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'savingsGoals'));
  },

  addExpense: async (expense: any) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expense,
        userId: auth.currentUser?.uid,
        date: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  },

  deleteExpense: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    }
  },

  updateBudget: async (category: string, amount: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const budgetId = `${userId}_${category}`;
      await setDoc(doc(db, 'budgets', budgetId), {
        category,
        amount,
        userId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'budgets');
    }
  },

  updateGoals: async (monthlyIncome: number, targetSavings: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const goalStore = collection(db, 'savingsGoals');
      const goalDoc = doc(goalStore, userId);
      await setDoc(goalDoc, {
        monthlyIncome,
        targetSavings,
        userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'savingsGoals');
    }
  },

  addAlert: async (alert: { message: string; type: 'info' | 'warning' | 'error' }) => {
    try {
      await addDoc(collection(db, 'alerts'), {
        ...alert,
        userId: auth.currentUser?.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'alerts');
    }
  },

  deleteBudget: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `budgets/${id}`);
    }
  },

  updatePreferences: async (prefs: { pushEnabled?: boolean; emailEnabled?: boolean; linkedApps?: string[] }) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await setDoc(doc(db, 'preferences', user.uid), prefs, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'preferences');
    }
  },

  resetAllData: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const batch = writeBatch(db);

      // Clear expenses
      const expQ = query(collection(db, 'expenses'), where('userId', '==', user.uid));
      const expSnap = await getDocs(expQ);
      expSnap.docs.forEach(doc => batch.delete(doc.ref));
      
      // Clear budgets
      const budQ = query(collection(db, 'budgets'), where('userId', '==', user.uid));
      const budSnap = await getDocs(budQ);
      budSnap.docs.forEach(doc => batch.delete(doc.ref));

      // Clear savings goals
      const goalsQ = query(collection(db, 'savingsGoals'), where('userId', '==', user.uid));
      const goalsSnap = await getDocs(goalsQ);
      goalsSnap.docs.forEach(doc => batch.delete(doc.ref));

      // Clear alerts
      const alertsQ = query(collection(db, 'alerts'), where('userId', '==', user.uid));
      const alertsSnap = await getDocs(alertsQ);
      alertsSnap.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'multiple');
    }
  },

  subscribeToPreferences: (userId: string, callback: (prefs: any) => void) => {
    return onSnapshot(doc(db, 'preferences', userId), (doc) => {
      callback(doc.exists() ? doc.data() : { pushEnabled: false, emailEnabled: false });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `preferences/${userId}`);
    });
  }
};
