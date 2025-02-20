"use client"
import React, { useEffect, useState } from 'react'
import { Plus, Monitor, ArrowRight, Trash2, Activity } from 'lucide-react'
import { createPost, deletePost, getPostsByCompanyEmail } from '@/app/(root)/account/_actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const PageList = ({email}:{email:string}) => {
  const [newPostName, setNewPostName] = useState("")
  const [loading, setLoading] = useState<boolean>(false)
  const [posts, setPosts] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreatePost = async () => {
    if (newPostName && email) {
      try {
        setLoading(true)
        await createPost(email, newPostName)
        setNewPostName("")
        fetchPosts()
        setIsModalOpen(false)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id)
      fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchPosts = async () => {
    if (email) {
      try {
        setLoading(true)
        const data = await getPostsByCompanyEmail(email)
        if (data) {
          setPosts(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [email])

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des postes</h2>
          <p className="text-gray-500 mt-1">Gérez vos guichets et points de service</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Nouveau guichet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau guichet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nom du guichet
                </label>
                <Input
                  id="name"
                  placeholder="Ex: Guichet 1"
                  value={newPostName}
                  onChange={(e) => setNewPostName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button 
              onClick={handleCreatePost}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le guichet'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <Monitor className="w-full h-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Aucun guichet</h3>
          <p className="text-gray-500 mt-2">Créez votre premier guichet pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div 
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">{post.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Activity className="w-4 h-4 mr-2" />
                    Statut: {post.status || 'En attente'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Créé le {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={`/poste/${post.id}`}
                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Accéder au guichet
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageList
