"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { setCompanyPageName } from "../_actions";
import { Settings } from "lucide-react";

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
        <Button variant="ghost" className="bg-white text-primary">
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm font-medium ">
            Le nom de votre page (pas modifiable)
          </label>
          {pageName ? (
            <div className="p-2 bg-accent text-gray-800 rounded-md text-center">
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
