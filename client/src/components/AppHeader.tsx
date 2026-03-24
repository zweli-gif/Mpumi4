import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { 
  Home as HomeIcon, 
  LayoutDashboard, 
  Cog, 
  Calendar, 
  CalendarDays, 
  Settings,
  LogOut,
  User
} from "lucide-react";

const navItems = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/engine", icon: Cog, label: "Engine" },
  { href: "/monthly", icon: Calendar, label: "Monthly" },
  { href: "/weekly", icon: CalendarDays, label: "Weekly" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

// Get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function AppHeader() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    }
  });

  // Check if current path matches nav item (handle sub-routes)
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">
            Growth <span className="text-pink-500">F</span>arm
          </span>
        </Link>

        {/* Navigation + User Profile */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-pink-500 bg-pink-50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-pink-500" : ""}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/20">
                  <Avatar className="h-8 w-8 border-2 border-pink-200">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
