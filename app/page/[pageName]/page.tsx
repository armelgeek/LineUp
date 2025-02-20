"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { createTicket, getTicketsByIds,getServicesByPageName } from '@/app/(root)/account/_actions'
import TicketComponent, { TicketType } from '@/shared/components/ticket'
import { Input } from '@/components/ui/input'

const Page = ({ params: { pageName } }: { params: { pageName: string } }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [ticketNums, setTicketNums] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [calledTickets, setCalledTickets] = useState<any[]>([]);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fonction pour jouer le son de notification
  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error('Erreur lecture audio:', e));
    }
  }, []);

  // Fonction pour gérer l'affichage des tickets appelés
  const handleCalledTicket = useCallback((ticket: any) => {
    setCalledTickets(prev => {
      // Ne pas ajouter si le ticket est déjà dans la file
      if (prev.some(t => t.id === ticket.id)) return prev;
      return [...prev, ticket];
    });

    // Afficher le modal s'il n'est pas déjà visible
    if (!showCallModal) {
      setShowCallModal(true);
      playNotification();
    }
  }, [showCallModal, playNotification]);

  // Effet pour gérer la file d'attente des tickets appelés
  useEffect(() => {
    if (calledTickets.length > 0 && !showCallModal) {
      setShowCallModal(true);
      playNotification();
    }
  }, [calledTickets, showCallModal, playNotification]);

  // Effet pour fermer automatiquement le modal après un délai
  useEffect(() => {
    if (showCallModal && modalTimeoutRef.current === null) {
      modalTimeoutRef.current = setTimeout(() => {
        setShowCallModal(false);
        modalTimeoutRef.current = null;
        // Retirer le premier ticket de la file
        setCalledTickets(prev => prev.slice(1));
      }, 5000); // 5 secondes d'affichage
    }

    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
        modalTimeoutRef.current = null;
      }
    };
  }, [showCallModal]);

  // Effet pour surveiller les changements de statut des tickets
  useEffect(() => {
    const newlyCalledTickets = tickets.filter(
      ticket => ticket.status === 'CALL' && 
      !calledTickets.some(called => called.id === ticket.id)
    );

    newlyCalledTickets.forEach(ticket => {
      handleCalledTicket(ticket);
    });
  }, [tickets, handleCalledTicket]);

  const [pageNameState, setPageNameState] = useState<string | null>(null)
  const [servicesState, setServicesState] = useState<unknown[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [nameComplete, setNameComplete] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<'service' | 'name'>('service')

  const resolveParamsAndFetchServices = async () => {
    try {
      setPageNameState(pageName)
      const servicesList = await getServicesByPageName(pageName)

      if (servicesList) {
        setServicesState(servicesList)
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
       const validTickets = fetchedTickets?.filter(tk => tk.status !== "FINISHED")
      const validTicketNums = validTickets?.map(tk => tk.num)
      localStorage.setItem('ticketNums', JSON.stringify(validTicketNums))
      if (validTickets)
        setTickets(validTickets)

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
    <div className='h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden'>
      {/* Audio pour la notification */}
      <audio ref={audioRef}>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      <div className='container mx-auto px-4 py-2 h-full flex flex-col'>
        {/* En-tête */}
        <header className="bg-white/80 backdrop-blur-md rounded-xl p-3 mb-2 relative overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-red-500/5"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-lg">
                  {pageNameState}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-lg font-medium">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              <div className="flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-medium">
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-gray-600 font-medium">En ligne</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1">
          {/* Section Video */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden">
            <div className="w-full h-full bg-gray-50 relative">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/d51diKTSi2M?autoplay=1&mute=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Section File d'Attente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-900">File d'attente</h2>
                <div className="flex items-center space-x-2">
                  <span className="relative flex size-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/30"></span>
                    <span className="relative inline-flex size-3 rounded-full bg-blue-500"></span>
                  </span>
                  <span className="text-sm text-gray-600">Mise à jour dans {countdown}s</span>
                </div>
              </div>

              <div className="space-y-3">
                {tickets.map((ticket, index) => (
                  <div 
                    key={ticket.id} 
                    className={`relative overflow-hidden transition-all duration-300 transform hover:scale-105 
                      ${['from-orange-100', 'from-purple-100', 'from-blue-100', 'from-green-100'][index] || 'from-gray-100'} 
                      to-white bg-gradient-to-r rounded-xl border border-gray-200 shadow-lg hover:shadow-xl`}
                  >
                    <div className="px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center">
                      <div className="text-sm font-bold text-gray-800">
                        {ticket.serviceName}
                      </div>
                      <div className={`
                        ${ticket.status === 'CALL' ? 'bg-blue-500 animate-pulse' : 
                          ticket.status === 'IN_PROGRESS' ? 'bg-green-500' : 
                          ticket.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'}
                        text-white text-xs px-3 py-1 rounded-full font-medium tracking-wide shadow-sm`}
                      >
                        {ticket.status === 'CALL' ? 'Appelé' :
                         ticket.status === 'IN_PROGRESS' ? 'En cours' :
                         ticket.status === 'PENDING' ? 'En attente' : 'Inconnu'}
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex  justify-between">
                        <div className="flex justify-between items-center space-x-3">
                          <div className={`text-3xl font-black ${['text-orange-600', 'text-purple-600', 'text-blue-600', 'text-green-600'][index] || 'text-gray-600'}`}>
                            #{ticket.num}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide">
                                Guichet
                              </span>
                              <span className="text-base font-bold text-gray-800">
                                {ticket.post?.name || 'non assigné'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div className="text-center py-8 bg-white rounded-xl border border-gray-200 shadow-lg">
                    <div className="bg-blue-50 size-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Aucun ticket en attente</p>
                    <p className="text-sm text-gray-600">Créez un nouveau ticket pour commencer</p>
                  </div>
                )}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-scale-up">
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
                    {servicesState.map((service) => (
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

        {/* Modal pour les tickets appelés */}
        {showCallModal && calledTickets.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-scale-up">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                <div className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  Ticket Appelé
                </div>
                <div className="text-6xl font-black text-red-600 mb-6 animate-bounce">
                  #{calledTickets[0].num}
                </div>
                <div className="space-y-4">
                  <div className="text-xl font-medium text-gray-900">
                    {calledTickets[0].serviceName}
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-lg">
                    <span className="font-bold">Guichet {calledTickets[0].post?.name || 'non assigné'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
