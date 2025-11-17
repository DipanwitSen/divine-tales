import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Gamepad2, Users, Trophy } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const features = [
    { icon: Sparkles, title: "Sacred Stories", desc: "AI-generated wisdom from holy texts", path: "/stories" },
    { icon: Gamepad2, title: "Mind Games", desc: "Challenge yourself with spiritual games", path: "/games" },
    { icon: Users, title: "Community", desc: "Connect with fellow seekers", path: "/community" },
    { icon: BookOpen, title: "Learning Path", desc: "Daily tasks for growth", path: "/learning" },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-12">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Welcome to SoulPath
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your journey of wisdom, growth, and spiritual discovery begins here
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {features.map((feature) => (
          <button
            key={feature.path}
            onClick={() => navigate(feature.path)}
            className="group p-6 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-lg text-left"
          >
            <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.desc}</p>
          </button>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={() => navigate("/avatar")} size="lg" variant="outline">
          <Trophy className="mr-2 h-5 w-5" />
          Customize Your Avatar
        </Button>
      </div>
    </div>
  );
};

export default Index;
