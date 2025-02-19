import { Loader } from 'lucide-react';
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
    switch (status) {
        case "IN_PROGRESS":
            return <div className='badge badge-primary'>En cours de traitement</div>
        case "PENDING":
            return <div className='badge badge-warning'>En attente</div>
        case "CALL":
            return <div className='badge badge-info'>Votre tour</div>
        case "FINISHED":
            return <div className='badge badge-success'>Servi</div>
        default:
            return <div className='badge badge-primary'>Statut inconnu</div>
    }
}



const TicketComponent: React.FC<TicketComponentProps> = ({ ticket, totalWaitTime = 0 }) => {

    const totalHours = Math.floor(totalWaitTime / 60)
    const totalMinutes = totalWaitTime % 60
    const formattedTotalWaitTime = `${totalHours}h ${totalMinutes}min`

    const [waitTimeStatus, setWaitTimeStatus] = useState("success")
    const [formattedRealWaitTime, setFormattedRealWaitTime] = useState("")

    useEffect(() => {

        if (!ticket || !ticket.createdAt) return

        const currentTime = new Date().getTime()
        const createdAtTime = new Date(ticket.createdAt).getTime()
        const waitTimeInMinutes = (currentTime - createdAtTime) / 60000

        const hours = Math.floor(waitTimeInMinutes / 60)
        const minutes = Math.floor(waitTimeInMinutes % 60)
        setFormattedRealWaitTime(`${hours}h ${minutes}min`)

        if (totalWaitTime !== 0) {
            if (waitTimeInMinutes > totalWaitTime) {
                setWaitTimeStatus("error")
            } else {
                setWaitTimeStatus("success")
            }
        }

    }, [ticket,totalWaitTime])


    console.log('status',ticket.status);
    return (
        <div className='border p-5 border-base-300 rounded-xl flex flex-col space-y-2'>

            <div className='mx-1 text-lg font-semibold'>
                <span className='text-lg font-semibold text-gray-500 badge'>
                    #{ticket.num}
                </span>
                <span className='font-bold text-xl'>
                    <span className='ml-2'>
                        {ticket?.serviceName}
                    </span>
                    {ticket.avgTime && (
                        <span className='badge badge-accent ml-2'>
                            {ticket.avgTime} min
                        </span>
                    )}
                </span>
            </div>

            <div className='flex flex-col md:flex-row md:justify-between'>
                <div className='flex flex-col btn btn-sm w-fit'>
                    {getStatusBadge(ticket.status)}
                </div>
                <div className="flex mt-2 md:mt-0">
                    <div className='font-semibold capitalize text-md'>
                        {ticket.nameComplete}
                    </div>
                </div>
            </div>
            <div className='border border-base-300 rounded-xl p-5'>
                    <span className='badge badge-accent badge-outline'>{ticket.status}</span>
            </div>
        </div>
    )
}

export default TicketComponent;
