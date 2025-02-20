import { Loader, User, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export type TicketType = {
    id: string;
    serviceId: string;
    num: string;
    nameComplete: string;
    status: string;
    createdAt: Date;
    postId: string | null;
    postName: string | null;
    serviceName: string;
    avgTime: number;
}

interface TicketComponentProps {
    ticket: TicketType;
    index?: number;
    totalWaitTime?: number;
}

const getStatusBadge = (status: string) => {
    const baseClasses = 'text-xs font-medium'
    switch (status) {
        case "IN_PROGRESS":
            return <span className={`${baseClasses} text-blue-600`}>En cours</span>
        case "PENDING":
            return <span className={`${baseClasses} text-amber-600`}>En attente</span>
        case "CALL":
            return <span className={`${baseClasses} text-emerald-600`}>Votre tour</span>
        case "FINISHED":
            return <span className={`${baseClasses} text-gray-600`}>Servi</span>
        default:
            return <span className={`${baseClasses} text-purple-600`}>Inconnu</span>
    }
}

const TicketComponent: React.FC<TicketComponentProps> = ({ ticket, totalWaitTime = 0 }) => {
    const [waitTimeStatus, setWaitTimeStatus] = useState<'normal' | 'warning' | 'danger'>('normal')
    const [formattedRealWaitTime, setFormattedRealWaitTime] = useState('')

    useEffect(() => {
        if (!ticket?.createdAt) return

        const updateWaitTime = () => {
            const currentTime = new Date().getTime()
            const createdAtTime = new Date(ticket.createdAt).getTime()
            const waitTimeInMinutes = (currentTime - createdAtTime) / 60000

            const hours = Math.floor(waitTimeInMinutes / 60)
            const minutes = Math.floor(waitTimeInMinutes % 60)
            setFormattedRealWaitTime(`${hours}h ${minutes}min`)

            if (totalWaitTime !== 0) {
                if (waitTimeInMinutes > totalWaitTime * 1.5) {
                    setWaitTimeStatus('danger')
                } else if (waitTimeInMinutes > totalWaitTime) {
                    setWaitTimeStatus('warning')
                } else {
                    setWaitTimeStatus('normal')
                }
            }
        }

        updateWaitTime()
        const interval = setInterval(updateWaitTime, 60000)
        return () => clearInterval(interval)
    }, [ticket, totalWaitTime])

    return (
        <div className='bg-white border rounded-lg overflow-hidden transition-all duration-300 hover:border-accent/50 group'>
            <div className='p-4'>
                {/* En-tête avec numéro et statut */}
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                        <span className='text-lg font-semibold text-green-500'>#{ticket.num}</span>
                        <h3 className='font-medium text-base-content/90'>{ticket.serviceName}</h3>
                    </div>
                    {getStatusBadge(ticket.status)}
                </div>

                {/* Info utilisateur et temps */}
                <div className='space-y-2 text-sm'>
                    {/* Utilisateur */}
                    <div className='flex items-center gap-2 text-base-content/70'>
                        <User size={16} className="text-accent/70" />
                        <span className='truncate'>{ticket.nameComplete}</span>
                    </div>

                    {/* Temps d'attente */}
                    <div className='flex items-center gap-4'>
                        {/* Temps moyen */}
                        {ticket.avgTime && (
                            <div className='flex items-center gap-1.5'>
                                <Clock size={16} className="text-accent/70" />
                                <span className='text-base-content/70'>{ticket.avgTime} min</span>
                            </div>
                        )}

                    </div>
                </div>

                {/* Barre de progression */}
               
            </div>
        </div>
    )
}

export default TicketComponent;
