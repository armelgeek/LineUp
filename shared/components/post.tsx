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
    <>

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold"> <span>Poste</span> <span className='badge badge-accent'>{namePoste ?? "aucun poste" }</span></h1>
        <div className="flex items-center">
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/30 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-accent"></span>
          </span>
          <div className="ml-2">
            ({countdown}s)
          </div>
          <Link href={`/call/${idPoste}`}
            className={`btn btn-sm ml-4 ${!namePoste && " btn-disabled"}`}
          >
            Appeler le suivant
          </Link>
        </div>
      </div>

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
  );
}

export default PostComponent
