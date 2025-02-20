"use client"
import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, AlertCircle, Timer, User, Calendar } from 'lucide-react'
import { get10LstFinishedTicketsByEmail, getTicketStatsByEmail } from '@/app/(root)/account/_actions'
import { TicketType } from '@/shared/components/ticket'

const StatCard = ({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
    <Icon className="w-12 h-12 text-blue-500 mr-4" />
    <div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

const TicketItem = ({ ticket }: { ticket: TicketType }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINISHED':
        return 'bg-green-100 text-green-800'
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className=" px-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
              {ticket.num}
            </div>
            <h3 className="font-medium text-gray-900">{ticket.serviceName}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            {ticket.nameComplete || 'Anonyme'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Timer className="w-4 h-4 mr-2" />
            {ticket.avgTime} minutes
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(ticket.createdAt)}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Guichet</span>
          <span className="font-medium text-gray-900">{ticket.postName || 'Non assigné'}</span>
        </div>
      </div>
    </div>
  )
}

const Dashboard = ({ email }: { email: string }) => {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [stats, setStats] = useState({ totalTickets: 0, resolvedTickets: 0, pendingTickets: 0 })

  useEffect(() => {
    const fetchData = async () => {
      if (email) {
        const [ticketData, statsData] = await Promise.all([
          get10LstFinishedTicketsByEmail(email),
          getTicketStatsByEmail(email)
        ])
        if (ticketData) setTickets(ticketData)
        if (statsData) setStats(statsData)
      }
    }
    fetchData()
  }, [email])

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-8 relative">
      <h1 className="text-3xl font-bold mb-8  text-gray-800">Tableau de Bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Tickets" value={stats.totalTickets} icon={Clock} />
        <StatCard title="Tickets Résolus" value={stats.resolvedTickets} icon={CheckCircle} />
        <StatCard title="Tickets En Attente" value={stats.pendingTickets} icon={AlertCircle} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Derniers Tickets Servis</h2>
            <p className="text-sm text-gray-500 mt-1">Les 10 derniers tickets traités</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Dernières 24h
            </span>
          </div>
        </div>
      
        {tickets.length === 0 ? (
          <div className="text-center py-12">
        
            <h3 className="text-lg font-medium text-gray-900">Aucun ticket récent</h3>
            <p className="text-gray-500 mt-2">Les tickets traités apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <TicketItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
