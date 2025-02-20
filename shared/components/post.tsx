"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import TicketComponent, { TicketType } from './ticket'
import { getPendingTicketsByEmail, getPostNameById } from '@/app/(root)/account/_actions'

const PostComponent = ({ idPoste, email }: { idPoste: string, email: string }) => {
 const [tickets, setTickets] = useState<TicketType[]>([])
  const [countdown, setCountdown] = useState<number>(5)
  const [namePoste, setNamePoste] = useState<string | null>(null)


  const fetchTickets = async () => {
    if (email) {
      try {
        const fetchedTickets = await getPendingTicketsByEmail(email);
        if (fetchedTickets) {
          setTickets(fetchedTickets)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [email])


  useEffect(() => {
    const handleCountdownAndRefresh = () => {
      if (countdown === 0) {
        fetchTickets()
        setCountdown(5)
      } else {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }
    }
    const timeoutId = setTimeout(handleCountdownAndRefresh, 1000)

    return () => clearTimeout(timeoutId)

  }, [countdown])

  const getPosteName = async () => {
    try {
      const postName = await getPostNameById(idPoste)
      if (postName)
        setNamePoste(postName)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getPosteName()
  }, [])




  return (
    <div className='px-5 md:px-[10%]'>

      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
          <span>Guichet</span>
          <span className='bg-white text-blue-600 px-2 py-1 rounded'>
            {namePoste ?? "Non assigné"}
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div>
              Mise à jour dans {countdown}s
            </div>
          </div>
          <Link href={`/call/${idPoste}`}
            className={`bg-white text-blue-600 hover:bg-blue-100 font-semibold py-2 px-4 rounded transition duration-300 ${!namePoste && "opacity-50 cursor-not-allowed"}`}
          >
            Appeler suivant
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-base-content/50">
          <p className="text-base">Aucun ticket en attente</p>
        </div>
      ) : (
        <div className="relative">
          {/* Scroll container */}
          <div className="overflow-x-auto pb-6 -mx-4 px-4">
            <div className="flex gap-4">
              {tickets.map((ticket, index) => {
                const totalWaitTime = tickets
                  .slice(0, index)
                  .reduce((acc, prevTicket) => acc + prevTicket.avgTime, 0)

                return (
                  <div key={ticket.id} 
                    className="animate-fadeIn w-[350px] flex-shrink-0"
                  >
                    <TicketComponent
                      ticket={ticket}
                      totalWaitTime={totalWaitTime}
                      index={index}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostComponent
