import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Heart, Trash2, Send } from "lucide-react";

export default function Community() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchPosts();

    const channel = supabase
      .channel('community_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (username),
          comments (
            *,
            profiles:user_id (username)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('community_posts').insert([{
        user_id: user.id,
        title: newPostTitle,
        content: newPostContent,
      }]);

      if (error) throw error;

      setNewPostTitle("");
      setNewPostContent("");
      toast({
        title: "Post created!",
        description: "Your wisdom has been shared.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId: string) => {
    const commentText = commentTexts[postId]?.trim();
    if (!commentText) return;

    try {
      const { error } = await supabase.from('comments').insert([{
        post_id: postId,
        user_id: user.id,
        content: commentText,
      }]);

      if (error) throw error;

      setCommentTexts({ ...commentTexts, [postId]: "" });
      fetchPosts();
      toast({
        title: "Comment added!",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
      toast({
        title: "Post deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      fetchPosts();
      toast({
        title: "Comment deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Community Circle
        </h1>
        <p className="text-muted-foreground">
          Share insights, connect with fellow seekers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Your Wisdom</CardTitle>
          <CardDescription>Create a new post</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Post title..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <Textarea
            placeholder="Share your thoughts, questions, or experiences..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={4}
          />
          <Button
            onClick={createPost}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Posting..." : "Share with Community"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                  <CardDescription>
                    By {post.profiles?.username || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                {user?.id === post.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">{post.content}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className="h-4 w-4" />
                  {post.likes}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments?.length || 0}
                </span>
              </div>

              {post.comments && post.comments.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  {post.comments.map((comment: any) => (
                    <div key={comment.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{comment.profiles?.username || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                      {user?.id === comment.user_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentTexts[post.id] || ""}
                  onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                />
                <Button
                  size="icon"
                  onClick={() => addComment(post.id)}
                  disabled={!commentTexts[post.id]?.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}