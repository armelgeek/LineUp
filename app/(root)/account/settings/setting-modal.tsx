"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { setCompanyPageName } from "../_actions";

interface SettingsModalProps {
  email?: string | null;
  pageName: string | null;
  onPageNameChange: (newPageName: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ email, pageName, onPageNameChange }) => {
  const [newPageName, setNewPageName] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSave = async () => {
    if (newPageName !== "") {
      setLoading(true);
      try {
        if (email) {
          await setCompanyPageName(email, newPageName);
          onPageNameChange(newPageName);
          setNewPageName("");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-white text-primary">
          <span className="sr-only">Paramètres</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37-.977 1.554-2.658 1.827-3.414 1.069a1.724 1.724 0 00-2.573 1.066C12.922 6.697 10.481 5.961 10.325 4.317zM15.683 18.685a9 9 0 0112.506 0l-.737-2.487a6 6 0 00-8.212-8.212L3.683 6.068a9 9 0 0112.506 0l-.736 2.487zm-4.953 1.315a4.897 4.897 0 01-6.364 6.364l-.547 2.026a4 4 0 005.456 0l.547-2.026zM6.758 18.092a1 1 0 01-.917-.373l-.178-7a1 1 0 012.183 0l.178 7zM16.847 7.608a1 1 0 01-.918.373l-.178 7a1 1 0 012.183 0l.178-7z" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Le nom de votre page (pas modifiable)
          </label>
          {pageName ? (
            <div className="p-2 bg-accent text-white rounded-md text-center">
              {pageName}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Nom de votre page"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
