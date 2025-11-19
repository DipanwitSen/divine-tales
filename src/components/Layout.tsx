import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Gamepad2, Users, User, BookOpen, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { toast } = useToast();
  const [theme, setTheme] = useState<string>("light");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.theme_preference) {
              setTheme(data.theme_preference);
              document.documentElement.classList.toggle('dark', data.theme_preference === 'dark');
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "Come back soon!",
    });
  };

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/stories", icon: Sparkles, label: "Stories" },
    { path: "/games", icon: Gamepad2, label: "Games" },
    { path: "/community", icon: Users, label: "Community" },
    { path: "/learning", icon: BookOpen, label: "Auratales" },
    { path: "/avatar", icon: User, label: "Avatar" },
  ];

  if (location.pathname === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              SoulPath
            </Link>
            <div className="hidden md:flex gap-2">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={location.pathname === link.path ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            {user && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}