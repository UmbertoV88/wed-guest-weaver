import { 
  Church, 
  Home, 
  Music, 
  Mail, 
  Gift, 
  Flower2, 
  Camera, 
  Car, 
  Heart, 
  Shirt, 
  UserCheck, 
  Sparkles, 
  Plane, 
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Church,
  Home,
  Music,
  Mail,
  Gift,
  Flower2,
  Camera,
  Car,
  Heart,
  Shirt,
  UserCheck,
  Sparkles,
  Plane,
  MoreHorizontal,
};

interface IconRendererProps {
  iconName?: string;
  className?: string;
  size?: number;
}

export const IconRenderer = ({ iconName, className = "h-4 w-4", size }: IconRendererProps) => {
  if (!iconName) return null;
  
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    // Fallback to first letter if icon not found
    return <span className={className}>{iconName.charAt(0)}</span>;
  }
  
  return <IconComponent className={className} size={size} />;
};