
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3,
  FileText,
  IndianRupee,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Finance Tracker</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden sm:flex",
                  location.pathname === "/admin" && "bg-accent text-accent-foreground"
                )}
                onClick={() => navigate("/admin")}
              >
                <Users className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-10 border-b bg-white">
        <div className="container flex items-center px-4 md:px-6">
          <div className="flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-1 border-b-2 border-transparent px-3 py-3 text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path
                    ? "border-primary text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Finance Tracker. All rights reserved.
          </p>
          <p className="text-center text-sm text-muted-foreground md:text-right">
            Currency: Indian Rupee (₹)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
