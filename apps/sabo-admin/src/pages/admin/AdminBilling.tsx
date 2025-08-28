import { useState } from 'react'
import { FileText, DollarSign, Clock, Download, Send, Eye, AlertTriangle } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  customer: string
  email: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  description: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function AdminBilling() {
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      customer: 'Champions Pool Club',
      email: 'billing@championsclub.com',
      amount: 500.00,
      currency: 'USD',
      status: 'paid',
      issueDate: '2024-08-01',
      dueDate: '2024-08-31',
      paidDate: '2024-08-25',
      description: 'Monthly subscription and tournament fees',
      items: [
        { description: 'Premium Club Subscription', quantity: 1, rate: 300.00, amount: 300.00 },
        { description: 'Tournament Entry Fees', quantity: 4, rate: 50.00, amount: 200.00 }
      ]
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      customer: 'Elite Players Association',
      email: 'admin@eliteplayers.com',
      amount: 750.00,
      currency: 'USD',
      status: 'pending',
      issueDate: '2024-08-15',
      dueDate: '2024-09-15',
      description: 'Professional tournament package',
      items: [
        { description: 'Professional Tournament Package', quantity: 1, rate: 750.00, amount: 750.00 }
      ]
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-003',
      customer: 'Metro Pool League',
      email: 'finance@metropool.com',
      amount: 320.00,
      currency: 'USD',
      status: 'overdue',
      issueDate: '2024-07-20',
      dueDate: '2024-08-20',
      description: 'League management services',
      items: [
        { description: 'League Management - July', quantity: 1, rate: 250.00, amount: 250.00 },
        { description: 'Additional Tournament Support', quantity: 1, rate: 70.00, amount: 70.00 }
      ]
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-004',
      customer: 'Riverside Billiards',
      email: 'contact@riverside.com',
      amount: 425.00,
      currency: 'USD',
      status: 'pending',
      issueDate: '2024-08-20',
      dueDate: '2024-09-20',
      description: 'Club subscription and event management',
      items: [
        { description: 'Standard Club Subscription', quantity: 1, rate: 200.00, amount: 200.00 },
        { description: 'Event Management Package', quantity: 1, rate: 225.00, amount: 225.00 }
      ]
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024-005',
      customer: 'Downtown Pool Hall',
      email: 'billing@downtown.com',
      amount: 150.00,
      currency: 'USD',
      status: 'cancelled',
      issueDate: '2024-08-10',
      dueDate: '2024-09-10',
      description: 'Basic membership plan',
      items: [
        { description: 'Basic Membership - August', quantity: 1, rate: 150.00, amount: 150.00 }
      ]
    }
  ])

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FileText className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <FileText className="h-4 w-4 text-gray-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getTotalRevenue = () => invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const getPendingAmount = () => invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)
  const getOverdueAmount = () => invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧾 Billing Management</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Create Invoice
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(getTotalRevenue())}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(getPendingAmount())}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(getOverdueAmount())}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoices List */}
        <div className="space-y-6">
          {/* Filter */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Invoices */}
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 ${
                  invoice.status === 'overdue' ? 'border-l-red-500' : 
                  invoice.status === 'pending' ? 'border-l-yellow-500' : 'border-l-transparent'
                }`}
                onClick={() => setSelectedInvoice(invoice)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{invoice.customer}</p>
                    <p className="text-sm text-gray-500">{invoice.email}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatCurrency(invoice.amount)}</div>
                    {invoice.status === 'overdue' && (
                      <div className="text-sm text-red-600">
                        {getDaysOverdue(invoice.dueDate)} days overdue
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <div>Issued: {invoice.issueDate}</div>
                    <div>Due: {invoice.dueDate}</div>
                    {invoice.paidDate && <div>Paid: {invoice.paidDate}</div>}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-600">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-purple-600">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {selectedInvoice ? 'Invoice Details' : 'Select an Invoice'}
            </h2>
          </div>
          
          <div className="p-6">
            {selectedInvoice ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedInvoice.invoiceNumber}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedInvoice.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedInvoice.status)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Bill To:</h4>
                      <p className="font-medium">{selectedInvoice.customer}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Invoice Info:</h4>
                      <p className="text-sm">Issue Date: {selectedInvoice.issueDate}</p>
                      <p className="text-sm">Due Date: {selectedInvoice.dueDate}</p>
                      {selectedInvoice.paidDate && (
                        <p className="text-sm text-green-600">Paid: {selectedInvoice.paidDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                          <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Rate</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.description}</td>
                            <td className="px-4 py-2 text-center text-sm">{item.quantity}</td>
                            <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.rate)}</td>
                            <td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan={3} className="px-4 py-2 text-right font-medium">Total:</td>
                          <td className="px-4 py-2 text-right font-bold text-lg">
                            {formatCurrency(selectedInvoice.amount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Email
                  </button>
                  {selectedInvoice.status === 'pending' && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an invoice to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📧 Send Reminders</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Send payment reminders to overdue invoices</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Send Reminders
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Revenue Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generate detailed billing reports</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">⚙️ Billing Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Configure billing and invoice settings</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  )
}
