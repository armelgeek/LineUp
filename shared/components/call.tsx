'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TicketComponent, { TicketType } from './ticket'
import { getLastTicketByEmail, getPostNameById, updateTicketStatus } from '@/app/(root)/account/_actions'

const CallComponent = ({email, idPoste}: {email: string, idPoste: string}) => {
    
    const [ticket, setTicket] = useState<TicketType | null>(null)
    const [namePoste, setNamePoste] = useState<string | null>(null)
    const router = useRouter()
    console.log('id poste',idPoste);
    const getData = async () => {
        try {
            if (email) {
    
                const data = await getLastTicketByEmail(email,idPoste)
                if (data) {
                    setTicket(data)
                }

                const postName = await getPostNameById(idPoste)
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
    }, [email, idPoste])

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="w-full max-w-2xl">
                {/* En-tête */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span>Guichet</span>
                            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-lg">
                                {namePoste ?? "Non assigné"}
                            </span>
                        </h1>
                        <Link 
                            href={`/poste/${idPoste}`}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full 
                                     transition duration-300 flex items-center gap-2 text-sm font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour au poste
                        </Link>
                    </div>
                </div>

                {/* Contenu */}
                {ticket ? (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-xl shadow-lg p-1">
                            <TicketComponent ticket={ticket} />
                        </div>
                        
                        <div className="flex justify-center gap-4">
                            {ticket.status === "CALL" && (
                                <button
                                    onClick={() => handleStatusChange('IN_PROGRESS')}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                                             hover:to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg
                                             transition duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Démarrer le traitement
                                </button>
                            )}

                            {ticket.status === "IN_PROGRESS" && (
                                <button
                                    onClick={() => handleStatusChange('FINISHED')}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 
                                             hover:to-green-700 text-white px-6 py-3 rounded-lg shadow-lg
                                             transition duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Terminer le traitement
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fadeIn">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Aucun ticket en attente</h3>
                                <p className="text-gray-500 mt-1">Les tickets apparaîtront ici une fois qu'ils seront appelés</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default CallComponent