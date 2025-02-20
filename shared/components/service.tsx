"use client"
import React, { useEffect, useState } from 'react'
import { Clock, ClockArrowUp, Trash2, Plus, Timer } from 'lucide-react'
import { createService, deleteServiceById, getServicesByEmail } from '@/app/(root)/account/_actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ServiceComponent = ({email}:{email:string}) => {
  const [serviceName, setServiceName] = useState("")
  const [avgTime, setAvgTime] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [services, setServices] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  const handleCreateService = async () => {
    if (serviceName && avgTime > 0 && email) {
      try {
        setLoading(true)
        await createService(email,serviceName, avgTime)
        setAvgTime(0)
        setServiceName("")
        fetchServices()
        setIsModalOpen(false)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      await deleteServiceById(id)
      fetchServices()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchServices = async () => {
    try {
      setIsLoadingServices(true)
      const data = await getServicesByEmail(email)
      if (data) {
        setServices(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingServices(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [email])

  return (
    <div className='border-b border-base-300 px-5 md:px-[10%] py-8 relative'>
      <div className="flex justify-between items-center mb-8">
         <div className="flex justify-between w-full items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                  <p className="mt-2 text-gray-600">
                    Gérez les services disponibles pour vos files d'attente
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Nouveau service
                </Button>
            </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nom du service
                </label>
                <Input
                  id="name"
                  placeholder="Ex: Consultation"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="time" className="text-right">
                  Temps moyen (min)
                </label>
                <Input
                  id="time"
                  type="number"
                  min="1"
                  placeholder="20"
                  value={avgTime}
                  onChange={(e) => setAvgTime(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateService}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !serviceName || avgTime <= 0}
            >
              {loading ? 'Création...' : 'Créer le service'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingServices ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <Clock className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Aucun service</h3>
          <p className="text-gray-500 mt-2">Créez votre premier service pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Temps moyen</span>
                    <div className="flex items-center text-blue-600">
                      <Timer className="w-4 h-4 mr-1" />
                      <span className="font-medium">{service.avgTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceComponent
