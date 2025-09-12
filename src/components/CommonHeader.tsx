import { Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface CommonHeaderProps {
  showAuthButtons?: boolean;
  className?: string;
  showSidebarTrigger?: boolean;
}

const CommonHeader = ({ showAuthButtons = false, className = "", showSidebarTrigger = false }: CommonHeaderProps) => {
  const { user } = useAuth();
  
  // Smart navigation logic
  const logoHref = user ? "/dashboard" : "/";

  return (
    <nav className={`relative z-20 bg-white/80 backdrop-blur-sm border-b border-primary/10 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSidebarTrigger && (
            <SidebarTrigger className="lg:hidden" />
          )}
          <Link to={logoHref} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="w-6 h-6 text-primary" fill="currentColor" />
            <span className="text-xl font-bold text-primary-deep">Wedding Planner</span>
          </Link>
        </div>
        
        {showAuthButtons && !user && (
          <div className="flex items-center gap-3">
            <Link to="/auth?tab=signin">
              <Button variant="ghost" className="text-primary-deep hover:text-primary">
                Accedi
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Registrati
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CommonHeader;