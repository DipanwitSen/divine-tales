import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Palette } from "lucide-react";

const hairStyles = [
  { id: "style1", label: "Short", emoji: "👤" },
  { id: "style2", label: "Long", emoji: "👩" },
  { id: "style3", label: "Curly", emoji: "🦱" },
  { id: "style4", label: "Bald", emoji: "👨‍🦲" },
];

const eyeStyles = [
  { id: "style1", label: "Round", emoji: "👁️" },
  { id: "style2", label: "Almond", emoji: "👀" },
  { id: "style3", label: "Wide", emoji: "😊" },
];

const skinTones = [
  { id: "tone1", label: "Light", color: "#FFE0BD" },
  { id: "tone2", label: "Medium", color: "#D4A574" },
  { id: "tone3", label: "Tan", color: "#A67856" },
  { id: "tone4", label: "Dark", color: "#6F4C3E" },
];

const genders = [
  { id: "male", label: "Male", emoji: "♂️" },
  { id: "female", label: "Female", emoji: "♀️" },
  { id: "neutral", label: "Neutral", emoji: "⚧️" },
];

export default function Avatar() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateAvatar = async (field: string, value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, [field]: value });
      toast({
        title: "Avatar updated!",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="text-center py-12">Loading avatar customization...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Avatar Customization
        </h1>
        <p className="text-muted-foreground">
          Create your unique spiritual identity
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle>Avatar Preview</CardTitle>
            </div>
            <CardDescription>Your current appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="aspect-square rounded-2xl flex items-center justify-center text-9xl"
              style={{ backgroundColor: skinTones.find(t => t.id === profile.avatar_skin)?.color }}
            >
              {hairStyles.find(h => h.id === profile.avatar_hair)?.emoji}
            </div>
            <div className="mt-4 text-center space-y-2">
              <p className="text-lg font-medium">{profile.username}</p>
              <p className="text-sm text-muted-foreground">
                Level {profile.level} • {profile.points} points
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Gender</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {genders.map((gender) => (
                  <Button
                    key={gender.id}
                    variant={profile.avatar_gender === gender.id ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => updateAvatar('avatar_gender', gender.id)}
                    disabled={loading}
                  >
                    <span className="text-2xl">{gender.emoji}</span>
                    <span className="text-xs">{gender.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hair Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {hairStyles.map((hair) => (
                  <Button
                    key={hair.id}
                    variant={profile.avatar_hair === hair.id ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => updateAvatar('avatar_hair', hair.id)}
                    disabled={loading}
                  >
                    <span className="text-2xl">{hair.emoji}</span>
                    <span className="text-xs">{hair.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eye Style</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {eyeStyles.map((eye) => (
                  <Button
                    key={eye.id}
                    variant={profile.avatar_eyes === eye.id ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => updateAvatar('avatar_eyes', eye.id)}
                    disabled={loading}
                  >
                    <span className="text-2xl">{eye.emoji}</span>
                    <span className="text-xs">{eye.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skin Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {skinTones.map((tone) => (
                  <Button
                    key={tone.id}
                    variant={profile.avatar_skin === tone.id ? "default" : "outline"}
                    className="h-16 flex flex-col gap-1"
                    onClick={() => updateAvatar('avatar_skin', tone.id)}
                    disabled={loading}
                    style={{
                      backgroundColor: profile.avatar_skin === tone.id ? tone.color : undefined,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-foreground/20"
                      style={{ backgroundColor: tone.color }}
                    />
                    <span className="text-xs">{tone.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}