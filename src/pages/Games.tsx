import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const games = [
  {
    id: "chess",
    title: "Chess Challenge",
    description: "Strategic thinking and planning",
    emoji: "♟️",
    comingSoon: true,
  },
  {
    id: "sudoku",
    title: "Sudoku Wisdom",
    description: "Logic and concentration",
    emoji: "🔢",
    comingSoon: true,
  },
  {
    id: "yoga",
    title: "Yoga Poses",
    description: "Mind-body harmony",
    emoji: "🧘",
    comingSoon: true,
  },
];

export default function Games() {
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          profiles:user_id (username, level)
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-accent" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Trophy className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Games & Challenges
        </h1>
        <p className="text-muted-foreground">
          Sharpen your mind through playful wisdom
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-5xl mb-2">{game.emoji}</div>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={game.comingSoon}
              >
                {game.comingSoon ? "Coming Soon" : "Play Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            <CardTitle>Global Leaderboard</CardTitle>
          </div>
          <CardDescription>Top players across all games</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Be the first to join the leaderboard!
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <p className="font-medium">{entry.profiles?.username || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">Level {entry.profiles?.level || 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{entry.score}</p>
                    <p className="text-xs text-muted-foreground capitalize">{entry.game_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}