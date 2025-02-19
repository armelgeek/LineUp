"use client"
import { AudioWaveform, GlobeLock, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { checkAndAddUser, getCompanyPageName } from "@/app/(root)/account/_actions";
import SettingsModal from "@/app/(root)/account/settings/setting-modal";

interface User {
  email: string;
  name: string;
}

const Navbar = ({ user }: { user: User }) => {  
  const [pageName, setPageName] = useState<string | null>(null);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Vos services" },
    { href: "/poste_list", label: "Vos postes" },
    { href: "/dashboard", label: "Tableau de bord" },
  ];

  useEffect(() => {
    const init = async () => {
      if (user.email && user.name) {
        await checkAndAddUser(user.email, user.name);
        const page = await getCompanyPageName(user.email);
        if (page) {
          setPageName(page);
        }
      }
    };
    init();
  }, [user]);

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AudioWaveform className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">LineUp</span>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {navLinks.map(({ href, label }) => (
            <Button variant="ghost" asChild key={href}>
              <Link href={href}>{label}</Link>
            </Button>
          ))}
          {pageName && (
            <Button variant="ghost" asChild>
              <Link href={`/page/${pageName}`}>
                <GlobeLock className="w-4 h-4" />
              </Link>
            </Button>
          )}
              <SettingsModal email={user.email} pageName={pageName} onPageNameChange={setPageName} />
          </div>
      </div>
    </div>
  );
};
export default Navbar;