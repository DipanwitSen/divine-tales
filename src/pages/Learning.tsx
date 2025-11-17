import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Check, Lock, Trophy, Star } from "lucide-react";

export default function Learning() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [tasksRes, progressRes, profileRes] = await Promise.all([
        supabase.from('learning_tasks').select('*').eq('active', true).order('created_at'),
        supabase.from('user_task_progress').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (progressRes.data) setUserProgress(progressRes.data);
      if (profileRes.data) setUserProfile(profileRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTask = async (taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('user_task_progress').insert([{
        user_id: user.id,
        task_id: taskId,
      }]);

      if (error) throw error;
      
      fetchData();
      toast({
        title: "Task started!",
        description: "You have 24 hours to complete it.",
      });
    } catch (error: any) {
      toast({
        title: "Error starting task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeTask = async (taskId: string, rewardPoints: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progress = userProgress.find(p => p.task_id === taskId);
      if (!progress) return;

      await supabase.from('user_task_progress')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', progress.id);

      await supabase.from('profiles')
        .update({ 
          points: (userProfile?.points || 0) + rewardPoints,
        })
        .eq('id', user.id);

      fetchData();
      toast({
        title: "Task completed! 🎉",
        description: `You earned ${rewardPoints} points!`,
      });
    } catch (error: any) {
      toast({
        title: "Error completing task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTaskProgress = (taskId: string) => {
    return userProgress.find(p => p.task_id === taskId);
  };

  const isTaskAvailable = (taskId: string) => {
    const progress = getTaskProgress(taskId);
    if (!progress) return true;
    if (progress.completed) {
      return new Date() >= new Date(progress.next_available_at);
    }
    return false;
  };

  const completedCount = userProgress.filter(p => p.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) {
    return <div className="text-center py-12">Loading your learning path...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Learning Path
        </h1>
        <p className="text-muted-foreground">
          Daily challenges for spiritual growth
        </p>
      </div>

      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-accent" />
              <CardTitle>Your Progress</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent fill-accent" />
              <span className="text-2xl font-bold">{userProfile?.points || 0}</span>
            </div>
          </div>
          <CardDescription>Level {userProfile?.level || 1} • {completedCount} tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const progress = getTaskProgress(task.id);
          const available = isTaskAvailable(task.id);
          const completed = progress?.completed || false;

          return (
            <Card
              key={task.id}
              className={`transition-all ${
                !available ? "opacity-60" : ""
              } ${completed ? "border-accent/30 bg-accent/5" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {completed ? (
                        <Check className="h-5 w-5 text-accent" />
                      ) : !available ? (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </div>
                    <CardDescription>{task.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-accent" />
                      <span className="font-bold">{task.reward_points}</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{task.difficulty}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!progress && available && (
                  <Button
                    onClick={() => startTask(task.id)}
                    className="w-full"
                  >
                    Start Task
                  </Button>
                )}
                {progress && !completed && available && (
                  <Button
                    onClick={() => completeTask(task.id, task.reward_points)}
                    className="w-full bg-gradient-to-r from-primary to-primary-glow"
                  >
                    Mark as Complete
                  </Button>
                )}
                {completed && (
                  <div className="text-center py-2 text-accent font-medium">
                    ✓ Completed! Next available in 24 hours
                  </div>
                )}
                {!available && !completed && (
                  <div className="text-center py-2 text-muted-foreground">
                    Available again soon...
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}