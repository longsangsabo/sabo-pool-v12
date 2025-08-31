import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, BarChart3, Download } from 'lucide-react'

interface FinancialData {
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  status: 'completed' | 'pending' | 'failed'
}

export default function AdminFinance() {
  const [financialData] = useState<FinancialData>({
    totalRevenue: 245680,
    monthlyRevenue: 32450,
    revenueGrowth: 15.6,
    totalExpenses: 156780,
    netProfit: 88900,
    profitMargin: 36.2
  })

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2024-08-28',
      description: 'Tournament Entry Fees - Summer Championship',
      amount: 5450,
      type: 'income',
      category: 'Tournament Fees',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-08-28',
      description: 'Club Membership Fees',
      amount: 2890,
      type: 'income',
      category: 'Membership',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-08-27',
      description: 'Server Hosting Costs',
      amount: -890,
      type: 'expense',
      category: 'Infrastructure',
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-08-27',
      description: 'Prize Pool Distribution',
      amount: -15000,
      type: 'expense',
      category: 'Prize Money',
      status: 'completed'
    },
    {
      id: '5',
      date: '2024-08-26',
      description: 'Advertisement Revenue',
      amount: 3250,
      type: 'income',
      category: 'Advertising',
      status: 'pending'
    }
  ])

  const [revenueData] = useState([
    { month: 'Jan', revenue: 28500, expenses: 18900 },
    { month: 'Feb', revenue: 31200, expenses: 19500 },
    { month: 'Mar', revenue: 29800, expenses: 20100 },
    { month: 'Apr', revenue: 33500, expenses: 20800 },
    { month: 'May', revenue: 35200, expenses: 21200 },
    { month: 'Jun', revenue: 32900, expenses: 19800 },
    { month: 'Jul', revenue: 34600, expenses: 22100 },
    { month: 'Aug', revenue: 32450, expenses: 21500 }
  ])

  const [selectedPeriod, setSelectedPeriod] = useState('monthly')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-success' : 'text-error'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💰 Finance Management</h1>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(financialData.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Monthly Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(financialData.monthlyRevenue)}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Revenue Growth</p>
              <p className="text-xl font-bold text-success">+{financialData.revenueGrowth}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold">{formatCurrency(financialData.totalExpenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Net Profit</p>
              <p className="text-xl font-bold text-success">{formatCurrency(financialData.netProfit)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Profit Margin</p>
              <p className="text-xl font-bold text-success">{financialData.profitMargin}%</p>
            </div>
            <PieChart className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">Revenue vs Expenses</h2>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex flex-col gap-1 w-full">
                    <div 
                      className="bg-success-background0 rounded-t"
                      style={{ height: `${(data.revenue / 40000) * 200}px` }}
                      title={`Revenue: ${formatCurrency(data.revenue)}`}
                    ></div>
                    <div 
                      className="bg-error-background0 rounded-b"
                      style={{ height: `${(data.expenses / 40000) * 200}px` }}
                      title={`Expenses: ${formatCurrency(data.expenses)}`}
                    ></div>
                  </div>
                  <span className="text-xs text-neutral dark:text-gray-400">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-background0 rounded"></div>
                <span className="text-sm">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-error-background0 rounded"></div>
                <span className="text-sm">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">Revenue Sources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Tournament Fees</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[45%]"></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Membership Fees</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-[30%]"></div>
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Advertising</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[15%]"></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Sponsorships</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full w-[10%]"></div>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-background dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-background dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm">{transaction.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{transaction.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{transaction.category}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Financial Reports</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Generate detailed financial reports</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Generate Report
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">💳 Payment Methods</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Manage payment gateways and methods</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Manage Payments
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📈 Forecasting</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">View revenue and expense forecasts</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            View Forecast
          </button>
        </div>
      </div>
    </div>
  )
}
