'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useTheme } from '../components/ThemeProvider';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const categories = [
  'Food',
  'Clothing',
  'Shopping',
  'Transportation',
  'Bills',
  'Health',
  'Other',
];

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'EXPENSE',
    category: 'Food',
    description: '',
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTransaction, setEditTransaction] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, timeRange]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?timeRange=${timeRange}`);
      const data = await response.json();
      setTransactions(data.filter(t => t.id));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        setNewTransaction({
          amount: '',
          type: 'EXPENSE',
          category: 'Food',
          description: '',
        });
        fetchTransactions();
        toast.success('Transaction added successfully!');
      } else {
        toast.error('Failed to add transaction.');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Error adding transaction.');
    }
  };

  const getChartData = () => {
    const dates = transactions.map((t) => new Date(t.date).toLocaleDateString());
    const amounts = transactions.map((t) =>
      t.type === 'INCOME' ? t.amount : -t.amount
    );

    return {
      labels: dates,
      datasets: [
        {
          label: 'Balance',
          data: amounts,
          borderColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
          backgroundColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
          tension: 0.4,
        },
      ],
    };
  };

  const getCategoryData = () => {
    const categoryTotals = categories.reduce((acc, category) => {
      acc[category] = transactions
        .filter((t) => t.category === category && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);
      return acc;
    }, {});

    return {
      labels: categories,
      datasets: [
        {
          data: categories.map((category) => categoryTotals[category]),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#C9CBCF',
          ],
        },
      ],
    };
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        toast.success('Transaction deleted successfully!');
      } else {
        toast.error('Failed to delete transaction.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error deleting transaction.');
    }
  };

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id);
    setEditTransaction({ ...transaction, id: transaction.id });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTransaction((prev) => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
  };

  const handleEditSave = async (id) => {
    if (!id) {
      toast.error('Transaction ID is missing. Cannot save changes.');
      return;
    }
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTransaction),
      });
      if (response.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...editTransaction } : t))
        );
        setEditingId(null);
        setIsModalOpen(false);
        toast.success('Transaction updated successfully!');
      } else {
        toast.error('Failed to update transaction.');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Error updating transaction.');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTransaction({});
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={theme === 'dark' ? 'dark' : 'light'} />
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Expense Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              {session?.user?.name && (
                <span className="text-md text-gray-700 dark:text-gray-300">
                  {session.user.name}
                </span>
              )}
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Add Transaction Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add Transaction
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Transaction
                </button>
              </form>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Balance Over Time
                  </h2>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
                <Line
                  data={getChartData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Expenses by Category
                </h2>
                <Doughnut
                  data={getCategoryData()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Transactions
              </h3>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction, index) => (
                  <li
                    key={transaction.id ?? `${transaction.category}-${transaction.amount}-${transaction.date}-${index}`}
                    className="px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description || transaction.category}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            transaction.type === 'INCOME'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        {transaction.id && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(transaction)}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(transaction.id)}
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for editing transaction */}
      <Modal isOpen={isModalOpen} onClose={handleEditCancel}>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Transaction</h2>
        {!editTransaction.id && (
          <div className="text-red-600 mb-2">This transaction cannot be edited because it has no ID.</div>
        )}
        <div className="flex flex-col gap-2">
          <input
            type="number"
            name="amount"
            value={editTransaction.amount ?? ''}
            onChange={handleEditChange}
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1 w-full"
            placeholder="Amount"
          />
          <select
            name="type"
            value={editTransaction.type ?? ''}
            onChange={handleEditChange}
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <select
            name="category"
            value={editTransaction.category ?? ''}
            onChange={handleEditChange}
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="description"
            value={editTransaction.description ?? ''}
            onChange={handleEditChange}
            className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-2 py-1"
            placeholder="Description"
          />
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleEditSave(editTransaction.id)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 