import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home as HomeIcon, LayoutDashboard, Cog, Calendar, CalendarDays, Settings, Loader2, Users, Rocket, Target, Shield, Compass } from "lucide-react";
import { Link, useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";

// Custom icons matching the design
const CommunityEngagementIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <circle cx="24" cy="24" r="18" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1.5"/>
    <circle cx="16" cy="20" r="5" fill="#81C784"/>
    <circle cx="32" cy="20" r="5" fill="#81C784"/>
    <circle cx="24" cy="32" r="5" fill="#81C784"/>
    <path d="M16 20 L24 32 L32 20" stroke="#4CAF50" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="12" r="3" fill="#4CAF50"/>
  </svg>
);

const NewFrontiersIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <path d="M24 4 L28 18 L44 18 L31 28 L36 44 L24 34 L12 44 L17 28 L4 18 L20 18 Z" fill="#E3F2FD" stroke="#7C4DFF" strokeWidth="1.5"/>
    <circle cx="24" cy="22" r="6" fill="#7C4DFF"/>
    <path d="M24 16 L24 10 M20 18 L16 14 M28 18 L32 14" stroke="#7C4DFF" strokeWidth="2"/>
  </svg>
);

const ImpactDeliveryIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <circle cx="24" cy="24" r="18" fill="#E3F2FD" stroke="#2196F3" strokeWidth="1.5"/>
    <circle cx="24" cy="24" r="12" fill="none" stroke="#64B5F6" strokeWidth="2"/>
    <circle cx="24" cy="24" r="6" fill="#2196F3"/>
    <path d="M24 6 L24 12 M24 36 L24 42 M6 24 L12 24 M36 24 L42 24" stroke="#2196F3" strokeWidth="2"/>
  </svg>
);

const StewardshipIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <circle cx="24" cy="24" r="18" fill="#FFF8E1" stroke="#FFB300" strokeWidth="1.5"/>
    <path d="M24 10 L24 26 L34 32" stroke="#FFB300" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <circle cx="24" cy="24" r="3" fill="#FFB300"/>
    <text x="24" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFB300">$</text>
  </svg>
);

const PurposePlatformIcon = () => (
  <svg viewBox="0 0 48 48" className="w-12 h-12">
    <circle cx="24" cy="24" r="18" fill="#FCE4EC" stroke="#E91E63" strokeWidth="1.5"/>
    <path d="M24 8 L24 18 M24 30 L24 40" stroke="#E91E63" strokeWidth="2"/>
    <path d="M14 18 L34 18 M14 30 L34 30" stroke="#E91E63" strokeWidth="2"/>
    <circle cx="24" cy="24" r="4" fill="#E91E63"/>
    <circle cx="14" cy="24" r="3" fill="#F48FB1"/>
    <circle cx="34" cy="24" r="3" fill="#F48FB1"/>
  </svg>
);

const engineTiles = [
  { id: "community-engagement", name: "COMMUNITY ENGAGEMENT", icon: CommunityEngagementIcon, href: "/engine/community-engagement", color: "bg-green-50 hover:bg-green-100 border-green-200" },
  { id: "new-frontiers", name: "NEW FRONTIERS", icon: NewFrontiersIcon, href: "/engine/new-frontiers", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
  { id: "impact-delivery", name: "IMPACT DELIVERY", icon: ImpactDeliveryIcon, href: "/engine/impact-delivery", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
  { id: "stewardship", name: "STEWARDSHIP", icon: StewardshipIcon, href: "/engine/stewardship", color: "bg-amber-50 hover:bg-amber-100 border-amber-200" },
  { id: "purpose-platform", name: "PURPOSE & PLATFORM", icon: PurposePlatformIcon, href: "/engine/purpose-platform", color: "bg-pink-50 hover:bg-pink-100 border-pink-200" },
];

export default function Engine() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleTileClick = (href: string) => {
    setIsModalOpen(false);
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <AppHeader />

      {/* Growth Operations Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          <DialogHeader className="px-6 pb-2">
            <DialogTitle className="text-2xl font-serif text-[#5C4B3A]">Growth Operations</DialogTitle>
            <p className="text-sm text-muted-foreground">Executive Dashboard Navigation</p>
          </DialogHeader>
          
          <div className="px-6 pb-4">
            {/* First row - 3 tiles */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {engineTiles.slice(0, 3).map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.href)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${tile.color}`}
                >
                  <tile.icon />
                  <span className="mt-2 text-[10px] font-semibold text-[#5C4B3A] tracking-wide text-center leading-tight">{tile.name}</span>
                </button>
              ))}
            </div>
            {/* Second row - 2 tiles centered */}
            <div className="grid grid-cols-2 gap-3 max-w-[66%] mx-auto">
              {engineTiles.slice(3).map((tile) => (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.href)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${tile.color}`}
                >
                  <tile.icon />
                  <span className="mt-2 text-[10px] font-semibold text-[#5C4B3A] tracking-wide text-center leading-tight">{tile.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <Button 
              variant="outline" 
              className="w-full py-6 text-sm font-medium tracking-wide border-2"
              onClick={() => setIsModalOpen(false)}
            >
              CLOSE MENU
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content - Shows when modal is closed */}
      <main className="container py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#5C4B3A]">Growth Operations</h2>
          <p className="text-muted-foreground">Select an area to manage</p>
        </div>

        {/* Quick access grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {engineTiles.map((tile) => (
            <Link
              key={tile.id}
              href={tile.href}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${tile.color}`}
            >
              <tile.icon />
              <span className="mt-3 text-sm font-semibold text-[#5C4B3A] tracking-wide text-center">{tile.name}</span>
            </Link>
          ))}
        </div>
      </main>


    </div>
  );
}
