import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Dna, 
  Activity, 
  TrendingUp, 
  Settings, 
  Upload, 
  FileCode,
  Shield,
  Zap,
  CreditCard,
  BarChart3
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", url: "/software-healing", icon: Home },
  { title: "Upload App", url: "/software-healing/upload", icon: Upload },
  { title: "DNA Scanner", url: "/software-healing/scanner", icon: Dna },
  { title: "Evolution Engine", url: "/software-healing/evolution", icon: TrendingUp },
  { title: "LiveBench 📊", url: "/software-healing/livebench", icon: BarChart3 },
  { title: "Monitoring", url: "/software-healing/monitoring", icon: Activity },
  { title: "Code Analysis", url: "/software-healing/analysis", icon: FileCode },
  { title: "Security", url: "/software-healing/security", icon: Shield },
  { title: "Performance", url: "/software-healing/performance", icon: Zap },
  { title: "Pricing", url: "/software-healing/pricing", icon: CreditCard },
  { title: "Settings", url: "/software-healing/settings", icon: Settings },
];

export function SoftwareHealingSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
            {isCollapsed ? "TDG" : "TDG Platform"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      {...(item.url === "/software-healing" && { end: true })}
                      className={({ isActive }) =>
                        `flex items-center gap-3 ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}