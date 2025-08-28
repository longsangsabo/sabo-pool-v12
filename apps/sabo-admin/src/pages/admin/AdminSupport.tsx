import { useState } from 'react'
import { HelpCircle, MessageSquare, Clock, CheckCircle, AlertTriangle, User, Search, Plus } from 'lucide-react'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  customer: string
  email: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  category: 'technical' | 'billing' | 'account' | 'general' | 'bug-report'
  assignee?: string
  createdAt: string
  updatedAt: string
  description: string
  messages: TicketMessage[]
}

interface TicketMessage {
  id: string
  sender: string
  message: string
  timestamp: string
  isStaff: boolean
}

export default function AdminSupport() {
  const [tickets] = useState<Ticket[]>([
    {
      id: '1',
      ticketNumber: 'TICKET-001',
      subject: 'Cannot register for tournament',
      customer: 'John Doe',
      email: 'john.doe@email.com',
      priority: 'high',
      status: 'open',
      category: 'technical',
      assignee: 'Support Agent 1',
      createdAt: '2024-08-28 14:30:00',
      updatedAt: '2024-08-28 15:45:00',
      description: 'User is unable to complete tournament registration. Payment fails at the final step.',
      messages: [
        {
          id: '1',
          sender: 'John Doe',
          message: 'I am trying to register for the Summer Championship but the payment keeps failing.',
          timestamp: '2024-08-28 14:30:00',
          isStaff: false
        },
        {
          id: '2',
          sender: 'Support Agent 1',
          message: 'Hi John, I can help you with this. Can you tell me which payment method you are using?',
          timestamp: '2024-08-28 15:45:00',
          isStaff: true
        }
      ]
    },
    {
      id: '2',
      ticketNumber: 'TICKET-002',
      subject: 'Billing inquiry for club subscription',
      customer: 'Jane Smith',
      email: 'jane.smith@email.com',
      priority: 'medium',
      status: 'in-progress',
      category: 'billing',
      assignee: 'Support Agent 2',
      createdAt: '2024-08-28 12:15:00',
      updatedAt: '2024-08-28 16:20:00',
      description: 'Customer has questions about their monthly club subscription billing.',
      messages: [
        {
          id: '1',
          sender: 'Jane Smith',
          message: 'I was charged twice for my club subscription this month. Can you help me understand why?',
          timestamp: '2024-08-28 12:15:00',
          isStaff: false
        }
      ]
    },
    {
      id: '3',
      ticketNumber: 'TICKET-003',
      subject: 'Account locked after password reset',
      customer: 'Mike Johnson',
      email: 'mike.j@email.com',
      priority: 'urgent',
      status: 'open',
      category: 'account',
      createdAt: '2024-08-28 11:00:00',
      updatedAt: '2024-08-28 11:00:00',
      description: 'User account became locked after attempting password reset multiple times.',
      messages: [
        {
          id: '1',
          sender: 'Mike Johnson',
          message: 'My account got locked after I tried to reset my password. I need help urgently as I have a tournament today.',
          timestamp: '2024-08-28 11:00:00',
          isStaff: false
        }
      ]
    },
    {
      id: '4',
      ticketNumber: 'TICKET-004',
      subject: 'Feature request: Tournament brackets view',
      customer: 'Tournament Organizer',
      email: 'organizer@club.com',
      priority: 'low',
      status: 'resolved',
      category: 'general',
      assignee: 'Product Manager',
      createdAt: '2024-08-27 16:00:00',
      updatedAt: '2024-08-28 10:30:00',
      description: 'Request for enhanced tournament bracket visualization features.',
      messages: [
        {
          id: '1',
          sender: 'Tournament Organizer',
          message: 'It would be great to have a better tournament bracket view for participants.',
          timestamp: '2024-08-27 16:00:00',
          isStaff: false
        },
        {
          id: '2',
          sender: 'Product Manager',
          message: 'Thank you for the feedback! We have added this to our roadmap for the next quarter.',
          timestamp: '2024-08-28 10:30:00',
          isStaff: true
        }
      ]
    }
  ])

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  const statuses = ['all', 'open', 'in-progress', 'resolved', 'closed']
  const priorities = ['all', 'low', 'medium', 'high', 'urgent']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800'
      case 'billing': return 'bg-purple-100 text-purple-800'
      case 'account': return 'bg-indigo-100 text-indigo-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      case 'bug-report': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getOpenTickets = () => tickets.filter(t => t.status === 'open').length
  const getUrgentTickets = () => tickets.filter(t => t.priority === 'urgent').length
  const getInProgressTickets = () => tickets.filter(t => t.status === 'in-progress').length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🎧 Support Center</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Ticket
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
              <p className="text-2xl font-bold text-red-600">{getOpenTickets()}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{getInProgressTickets()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{getUrgentTickets()}</p>
            </div>
            <HelpCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold">{tickets.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tickets List */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
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
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priority' : priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tickets */}
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 ${
                  ticket.priority === 'urgent' ? 'border-l-red-500' : 
                  ticket.status === 'open' ? 'border-l-yellow-500' : 'border-l-transparent'
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <div className="font-medium">{ticket.ticketNumber}</div>
                      <div className="text-sm text-gray-500">{ticket.customer}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">{ticket.subject}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{ticket.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(ticket.category)}`}>
                      {ticket.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="text-gray-500">
                    {ticket.updatedAt}
                  </div>
                </div>

                {ticket.assignee && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Assigned to: {ticket.assignee}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {selectedTicket ? 'Ticket Details' : 'Select a Ticket'}
            </h2>
          </div>
          
          <div className="p-6">
            {selectedTicket ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{selectedTicket.ticketNumber}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedTicket.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">Customer:</h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{selectedTicket.customer}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTicket.email}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Details:</h4>
                      <p className="text-sm">Created: {selectedTicket.createdAt}</p>
                      <p className="text-sm">Updated: {selectedTicket.updatedAt}</p>
                      {selectedTicket.assignee && (
                        <p className="text-sm">Assignee: {selectedTicket.assignee}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Description:</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Conversation:</h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {selectedTicket.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isStaff ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isStaff 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}>
                            <div className="font-medium text-sm mb-1">{message.sender}</div>
                            <div className="text-sm">{message.message}</div>
                            <div className="text-xs opacity-75 mt-1">{message.timestamp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-medium mb-4">Reply to Customer</h4>
                    <textarea 
                      placeholder="Type your reply..."
                      className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Send Reply
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Mark Resolved
                      </button>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📚 Knowledge Base</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Manage help articles and FAQs</p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Manage Knowledge Base
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">📊 Support Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">View support metrics and performance</p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
            View Analytics
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-2">⚙️ Support Settings</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Configure support workflows and rules</p>
          <button className="w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
            Configure Settings
          </button>
        </div>
      </div>
    </div>
  )
}
