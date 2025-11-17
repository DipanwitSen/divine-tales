import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, Pause, Heart } from "lucide-react";

const moods = [
  { value: "peaceful", label: "Peaceful", emoji: "🕊️" },
  { value: "inspired", label: "Inspired", emoji: "✨" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "seeking", label: "Seeking", emoji: "🔍" },
  { value: "reflective", label: "Reflective", emoji: "🌙" },
  { value: "joyful", label: "Joyful", emoji: "😊" },
];

const sources = [
  { value: "bible", label: "Holy Bible", emoji: "✝️" },
  { value: "upanishads", label: "Upanishads", emoji: "🕉️" },
  { value: "quran", label: "Holy Quran", emoji: "☪️" },
];

export default function Stories() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<{ title: string; content: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesisUtterance | null>(null);

  const generateStory = async () => {
    if (!selectedMood || !selectedSource) {
      toast({
        title: "Please select your mood and source",
        description: "We need both to create your perfect story.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: { mood: selectedMood, source: selectedSource }
      });

      if (error) throw error;

      setStory({ title: data.title, content: data.content });

      // Save to database
      if (userData.user) {
        await supabase.from('stories').insert([{
          user_id: userData.user.id,
          mood: selectedMood as any,
          source: selectedSource as any,
          title: data.title,
          content: data.content,
        }]);
      }

      toast({
        title: "Story created!",
        description: "Your personalized wisdom awaits.",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error generating story",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!story) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story.content);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };

    setSpeechSynthesis(utterance);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Sacred Story Generator
        </h1>
        <p className="text-muted-foreground">
          Discover wisdom tailored to your heart
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Choose your current mood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {moods.map((mood) => (
              <Button
                key={mood.value}
                variant={selectedMood === mood.value ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedMood(mood.value)}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span>{mood.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Source</CardTitle>
          <CardDescription>Select a sacred text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sources.map((source) => (
              <Button
                key={source.value}
                variant={selectedSource === source.value ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedSource(source.value)}
              >
                <span className="text-3xl">{source.emoji}</span>
                <span>{source.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={generateStory}
          disabled={loading || !selectedMood || !selectedSource}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {loading ? "Creating Your Story..." : "Generate Story"}
        </Button>
      </div>

      {story && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{story.title}</CardTitle>
                <CardDescription>Generated wisdom for you</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleSpeech}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{story.content}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}