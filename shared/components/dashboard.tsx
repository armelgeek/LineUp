"use client"
import React, { useEffect, useState } from 'react'
import TicketComponent, { TicketType } from '@/shared/components/ticket';
import { get10LstFinishedTicketsByEmail, getTicketStatsByEmail } from '@/app/(root)/account/_actions';

const StatCard = ({ title, value }: { title: string; value: number }) => {
    return (
        <div className='stats  md:w-1/3 border border-base-200'>
            <div className='stat'>
                <div className='stat-title'>{title}</div>
                <div className='stat-value'>{value}</div>
            </div>
        </div>
    )
}

const Dashboard = ({email}:{
    email: string
}) => {

    
    const [tickets, setTickets] = useState<TicketType[]>([])

    const [stats, setStats] = useState<{
        totalTickets: number;
        resolvedTickets: number;
        pendingTickets: number
    }>({
        totalTickets: 0,
        resolvedTickets: 0,
        pendingTickets: 0
    })

    const fetchTicketsAndStats = async () => {
        if (email) {
            const data = await get10LstFinishedTicketsByEmail(email)
            if (data) {
                setTickets(data)
            }
            const statsData = await getTicketStatsByEmail(email)
            if (statsData) {
                setStats(statsData)
            }

        }
    }

    useEffect(() => {
        fetchTicketsAndStats()
    }, [email])

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Statistiques</h1>

            <div className='w-full flex flex-col md:flex-row mb-4 gap-4'>
                <StatCard title='Total Tickets' value={stats.totalTickets} />
                <StatCard title='Tickets Résolus' value={stats.resolvedTickets} />
                <StatCard title='Tickets En Attente' value={stats.pendingTickets} />
            </div>

            <h1 className="text-2xl font-bold mb-4">Les 10 derniers Tickets servis</h1>

            {tickets.length === 0 ? (
                <div>
                    <p>Aucun ticket en attente</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">

                    {tickets.map((ticket, index) => {
                        const totalWaitTime = tickets
                            .slice(0, index)
                            .reduce((acc, prevTicket) => acc + prevTicket.avgTime, 0)

                        return (
                            <TicketComponent
                                key={ticket.id}
                                ticket={ticket}
                                totalWaitTime={totalWaitTime}
                                index={index}
                            />
                        )
                    })}

                </div>
            )}

        </>
    )
}

export default Dashboard
