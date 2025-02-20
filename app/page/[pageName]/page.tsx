"use client"

import React, { useEffect, useState } from 'react'
import { createTicket, getTicketsByIds,getServicesByPageName } from '@/app/(root)/account/_actions'
import TicketComponent, { TicketType } from '@/shared/components/ticket'
import { Input } from '@/components/ui/input'

const Page = ({ params }: { params: Promise<{ pageName: string }> }) => {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [pageName, setPageName] = useState<string | null>(null)
  const [services, setServices] = useState<unknown[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [nameComplete, setNameComplete] = useState<string>("")
  const [ticketNums, setTicketNums] = useState<unknown[]>([])
  const [countdown, setCountdown] = useState<number>(5)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<'service' | 'name'>('service')

  const resolveParamsAndFetchServices = async () => {
    try {
      const resolvedParams = await params
      setPageName(resolvedParams.pageName)
      const servicesList = await getServicesByPageName(resolvedParams.pageName)

      if (servicesList) {
        setServices(servicesList)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    resolveParamsAndFetchServices()

    const ticketNumsFromStorage = localStorage.getItem('ticketNums')
    console.log('ticketNumsFromStorage',ticketNumsFromStorage)
    if (ticketNumsFromStorage && ticketNumsFromStorage !== "undefined" ) {
      const savedTicketNums = JSON.parse(ticketNumsFromStorage)
      setTicketNums(savedTicketNums)
      if (savedTicketNums.length > 0) {
        fetchTicketsByIds(savedTicketNums)
      }
    } else {
      setTicketNums([])
    }


  }, [])

  const fetchTicketsByIds = async (ticketNums: string[]) => {
    try {
        console.log('ticketNums', ticketNums)
   
      const fetchedTickets = await getTicketsByIds(ticketNums)
      console.log('fetchedTickets', fetchedTickets);
      const validTicketNums = fetchedTickets?.map(tk => tk.num)
      localStorage.setItem('ticketNums', JSON.stringify(validTicketNums))
      if (fetchedTickets)
        setTickets(fetchedTickets)

    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceId || !nameComplete) {
      alert("Veuillez sélectionner un service et entrer votre nom.");
      return
    }
    try {
      const ticketNum = await createTicket(selectedServiceId, nameComplete)
      setSelectedServiceId(null)
      setNameComplete("")
      setIsModalOpen(false)
      setCurrentStep('service')
      const updatedTicketNums = [...ticketNums, ticketNum];
      setTicketNums(updatedTicketNums)
      localStorage.setItem("ticketNums", JSON.stringify(updatedTicketNums))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const handleCountdownAndRefresh = () => {
      if (countdown === 0) {
        if (ticketNums.length > 0)
          fetchTicketsByIds(ticketNums as string[])
        setCountdown(5)
      } else {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }
    }
    const timeoutId = setTimeout(handleCountdownAndRefresh, 1000)
    return () => clearTimeout(timeoutId)
  }, [countdown , ticketNums])

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white relative'>
      <div className='container mx-auto px-4 py-8'>
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-blue-900">
            <span className="bg-blue-100 px-3 py-1 rounded-full">@{pageName}</span>
          </div>
          <div className="text-xl text-gray-600">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })} - {new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Vidéo */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden bg-white shadow-lg border border-gray-100">
            <div className="aspect-video bg-gray-50 relative">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/watch?v=CZ6s0gJmxYc&list=PLsK0ky04EOdFlLY6r4S-JEgYpFkt53SLl&autoplay=1&mute=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-4">
                <p className="text-lg font-semibold text-blue-900">File d'attente en direct</p>
              </div>
            </div>
          </div>

          {/* Section File d'Attente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-blue-900">File d'Attente</h2>
                <div className="flex items-center space-x-2">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/30"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-blue-500"></span>
                  </span>
                  <span className="text-sm text-gray-600">Mise à jour dans {countdown}s</span>
                </div>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div 
                    key={ticket.id} 
                    className={`relative overflow-hidden transition-all duration-300 transform hover:scale-102 
                      ${index === 0 ? 'bg-gradient-to-r from-orange-50 to-white' :
                        index === 1 ? 'bg-gradient-to-r from-purple-50 to-white' :
                        index === 2 ? 'bg-gradient-to-r from-blue-50 to-white' :
                        'bg-gradient-to-r from-green-50 to-white'
                      } rounded-lg p-4 border border-gray-100`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-4xl font-bold
                        ${index === 0 ? 'text-orange-500' :
                          index === 1 ? 'text-purple-500' :
                          index === 2 ? 'text-blue-500' :
                          'text-green-500'
                        }`}>
                        {ticket.num}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Guichet {ticket.counterNumber || '-'}</div>
                        <div className="text-sm text-gray-600">{ticket.serviceName}</div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                        En cours
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-all duration-300 group z-10"
        >
          <div className="flex items-center">
            <span className="text-2xl mr-2">+</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
              Nouveau ticket
            </span>
          </div>
        </button>

        {/* Modale de création de ticket */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 relative">
              {/* Bouton fermer */}
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setCurrentStep('service')
                  setSelectedServiceId(null)
                  setNameComplete('')
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-blue-900">
                  {currentStep === 'service' ? 'Choisissez votre service' : 'Entrez vos informations'}
                </h2>
                <div className="flex mt-4">
                  <div className={`h-2 flex-1 rounded-l ${currentStep === 'service' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  <div className={`h-2 flex-1 rounded-r ${currentStep === 'name' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 'service' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => {
                          setSelectedServiceId(service.id)
                          setCurrentStep('name')
                        }}
                        className={`cursor-pointer transition-all duration-300 p-4 rounded-lg border-2 hover:scale-105
                          ${selectedServiceId === service.id 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                            ${selectedServiceId === service.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {service.name.charAt(0)}
                          </div>
                          <div className={`font-medium ${selectedServiceId === service.id ? 'text-blue-900' : 'text-gray-700'}`}>
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ~{service.avgTime} min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment pouvons-nous vous appeler ?
                      </label>
                      <Input
                        type="text"
                        placeholder="Votre nom"
                        className="input bg-gray-50 border-gray-200 text-gray-800 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                        onChange={(e) => setNameComplete(e.target.value)}
                        value={nameComplete}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('service')}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={!nameComplete}
                        className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Obtenir mon ticket
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Section Vos Tickets */}
        {tickets.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Vos Tickets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket, index) => (
                <TicketComponent
                  key={ticket.id}
                  ticket={ticket}
                  totalWaitTime={tickets
                    .slice(0, index)
                    .reduce((acc, prevTicket) => acc + prevTicket.avgTime, 0)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
