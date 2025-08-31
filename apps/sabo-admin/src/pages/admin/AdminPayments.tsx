import { useState } from 'react'
import { CreditCard, RefreshCw, CheckCircle, XCircle, Clock, Search, Download, AlertTriangle } from 'lucide-react'

interface Payment {
  id: string
  transactionId: string
  user: string
  amount: number
  currency: string
  method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  date: string
  description: string
  fees: number
  refundAmount?: number
}

export default function AdminPayments() {
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      transactionId: 'TXN-20240828-001',
      user: 'john.doe@email.com',
      amount: 50.00,
      currency: 'USD',
      method: 'Credit Card',
      status: 'completed',
      date: '2024-08-28 14:30:00',
      description: 'Tournament Entry Fee - Summer Championship',
      fees: 2.45
    },
    {
      id: '2',
      transactionId: 'TXN-20240828-002',
      user: 'jane.smith@email.com',
      amount: 25.00,
      currency: 'USD',
      method: 'PayPal',
      status: 'pending',
      date: '2024-08-28 13:15:00',
      description: 'Club Membership Fee',
      fees: 1.25
    },
    {
      id: '3',
      transactionId: 'TXN-20240828-003',
      user: 'player123@email.com',
      amount: 75.00,
      currency: 'USD',
      method: 'Bank Transfer',
      status: 'failed',
      date: '2024-08-28 12:45:00',
      description: 'Premium Membership Upgrade',
      fees: 0.00
    },
    {
      id: '4',
      transactionId: 'TXN-20240827-015',
      user: 'club.manager@email.com',
      amount: 100.00,
      currency: 'USD',
      method: 'Credit Card',
      status: 'refunded',
      date: '2024-08-27 16:20:00',
      description: 'Tournament Registration',
      fees: 3.50,
      refundAmount: 96.50
    },
    {
      id: '5',
      transactionId: 'TXN-20240827-012',
      user: 'pro.player@email.com',
      amount: 200.00,
      currency: 'USD',
      method: 'Stripe',
      status: 'completed',
      date: '2024-08-27 11:00:00',
      description: 'Professional Tournament Entry',
      fees: 8.30
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMethod, setSelectedMethod] = useState('all')

  const paymentMethods = ['all', 'Credit Card', 'PayPal', 'Bank Transfer', 'Stripe', 'Apple Pay', 'Google Pay']
  const statuses = ['all', 'completed', 'pending', 'failed', 'refunded']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded': return <RefreshCw className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getTotalPayments = () => payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const getTotalFees = () => payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.fees, 0)
  const getFailureRate = () => {
    const total = payments.length
    const failed = payments.filter(p => p.status === 'failed').length
    return total > 0 ? ((failed / total) * 100).toFixed(1) : '0'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">💳 Payment Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-var(--color-background) rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Payments
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold">{formatCurrency(getTotalPayments())}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Processing Fees</p>
              <p className="text-2xl font-bold">{formatCurrency(getTotalFees())}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-success">{(100 - parseFloat(getFailureRate())).toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold">{payments.filter(p => p.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-var(--color-background) dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>

          <select 
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method === 'all' ? 'All Methods' : method}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-background dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-background dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-sm">{payment.transactionId}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {payment.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{payment.user}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                      <div className="text-xs text-gray-500">Fee: {formatCurrency(payment.fees)}</div>
                      {payment.refundAmount && (
                        <div className="text-xs text-primary">Refunded: {formatCurrency(payment.refundAmount)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{payment.method}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{payment.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-var(--color-background) rounded text-sm hover:bg-blue-700">
                        View
                      </button>
                      {payment.status === 'completed' && (
                        <button className="px-3 py-1 bg-orange-600 text-var(--color-background) rounded text-sm hover:bg-orange-700">
                          Refund
                        </button>
                      )}
                      {payment.status === 'failed' && (
                        <button className="px-3 py-1 bg-green-600 text-var(--color-background) rounded text-sm hover:bg-green-700">
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-medium">Credit Cards</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <button className="px-3 py-1 bg-gray-600 text-var(--color-background) rounded text-sm">Configure</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-var(--color-background) text-xs font-bold">P</div>
                <div>
                  <div className="font-medium">PayPal</div>
                  <div className="text-sm text-gray-500">PayPal payments</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <button className="px-3 py-1 bg-gray-600 text-var(--color-background) rounded text-sm">Configure</button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 bg-purple-600 rounded flex items-center justify-center text-var(--color-background) text-xs font-bold">S</div>
                <div>
                  <div className="font-medium">Stripe</div>
                  <div className="text-sm text-gray-500">Stripe payment processing</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
                <button className="px-3 py-1 bg-gray-600 text-var(--color-background) rounded text-sm">Configure</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-neutral dark:border-gray-700">
            <h2 className="text-lg font-semibold">Payment Analytics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Credit Card</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[60%]"></div>
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>PayPal</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" className="w-1/4"></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Stripe</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[15%]"></div>
                  </div>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-4">Transaction Volume (Last 30 days)</h3>
              <div className="text-2xl font-bold text-success mb-2">{formatCurrency(45280)}</div>
              <div className="text-sm text-gray-500">+12.5% from last month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">🔄 Bulk Refunds</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Process multiple refunds at once</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-var(--color-background) rounded hover:bg-purple-700">
            Process Refunds
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Payment Reports</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Generate detailed payment reports</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-var(--color-background) rounded hover:bg-orange-700">
            Generate Report
          </button>
        </div>

        <div className="bg-var(--color-background) dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">⚙️ Gateway Settings</h3>
          <p className="text-sm text-neutral dark:text-gray-400 mb-4">Configure payment gateway settings</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-var(--color-background) rounded hover:bg-teal-700">
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  )
}
