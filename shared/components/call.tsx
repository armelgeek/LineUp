'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TicketComponent, { TicketType } from './ticket'
import { getLastTicketByEmail, getPostNameById, updateTicketStatus } from '@/app/(root)/account/_actions'

const CallComponent = ({email, params}: {email: string, params: Promise<{ idPoste: string }>}) => {
    
    const [idPoste, setIdPoste] = useState<string | null>(null)
    const [ticket, setTicket] = useState<TicketType | null>(null)
    const [namePoste, setNamePoste] = useState<string | null>(null)
    const router = useRouter()

    const getData = async () => {
        try {
            if (email) {
                const resolvedParams = await params;
                setIdPoste(resolvedParams.idPoste)
                const data = await getLastTicketByEmail(email, resolvedParams.idPoste)
                if (data) {
                    setTicket(data)
                }

                const postName = await getPostNameById(resolvedParams.idPoste)
                if (postName) {
                    setNamePoste(postName)
                }

            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getData()
    }, [email, params])

    const handleStatusChange = async (newStatus: string) => {
        if (ticket) {
            try {
                await updateTicketStatus(ticket.id, newStatus)
                if (newStatus === "FINISHED") {
                    router.push(`/poste/${idPoste}`)
                } else {
                    getData()
                }

            } catch (error) {
                console.error(error)
            }
        }
    }

    return (
        <>

            <div className='mb-4'>
                <h1 className="text-2xl font-bold"> <span>Poste</span> <span className='badge badge-accent'>{namePoste ?? "aucun poste"}</span></h1>
                <Link className='btn mt-4 btn-sm' href={`/poste/${idPoste}`}>Retour</Link>
            </div>
            {ticket ? (
                <div>

                    <TicketComponent
                        ticket={ticket}
                    />
                    <div className='flex space-x-4 mt-4'>
                        {ticket.status === "CALL" && (
                            <button
                                className='btn btn-accent btn-outline btn-sm'
                                onClick={() => handleStatusChange('IN_PROGRESS')}
                            >
                                Démarrer le traitement
                            </button>
                        )}

                        {ticket.status === "IN_PROGRESS" && (
                            <button
                                className='btn btn-accent btn-outline btn-sm'
                                onClick={() => handleStatusChange('FINISHED')}
                            >
                                Fin du traitement
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <p>Aucun ticket en attente</p>
                
                </div>

            )}
        </>
    )
}
export default CallComponent