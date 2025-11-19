import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ChessGame from "@/components/games/ChessGame";
import SudokuGame from "@/components/games/SudokuGame";
import MemoryGame from "@/components/games/MemoryGame";

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

      <Tabs defaultValue="chess" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="chess">♟️ Chess</TabsTrigger>
          <TabsTrigger value="sudoku">🔢 Sudoku</TabsTrigger>
          <TabsTrigger value="memory">🎴 Memory</TabsTrigger>
        </TabsList>
        <TabsContent value="chess" className="mt-6">
          <ChessGame />
        </TabsContent>
        <TabsContent value="sudoku" className="mt-6">
          <SudokuGame />
        </TabsContent>
        <TabsContent value="memory" className="mt-6">
          <MemoryGame />
        </TabsContent>
      </Tabs>

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