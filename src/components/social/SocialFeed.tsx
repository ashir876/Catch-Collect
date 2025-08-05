import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trophy, 
  Star,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SocialPost {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  content: string;
  image_url?: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  type: 'achievement' | 'collection' | 'wishlist' | 'general';
  card_id?: string;
  card_name?: string;
}

const SocialFeed = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with user information
      const { data: postsData, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          users:user_id (
            email,
            full_name,
            avatar_url
          ),
          cards:card_id (
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedPosts = postsData?.map(post => ({
        id: post.id,
        user_id: post.user_id,
        username: post.users?.full_name || post.users?.email?.split('@')[0] || 'Anonymous',
        avatar_url: post.users?.avatar_url,
        content: post.content,
        image_url: post.image_url || post.cards?.image_url,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        created_at: post.created_at,
        type: post.type,
        card_id: post.card_id,
        card_name: post.cards?.name
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // Toggle like
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: existingLike ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      // Update share count
      await supabase
        .from('social_posts')
        .update({ shares: posts.find(p => p.id === postId)?.shares + 1 })
        .eq('id', postId);

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares: post.shares + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const createPost = async () => {
    if (!user || !newPostContent.trim()) return;

    try {
      const { data: newPost, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: newPostContent,
          type: 'general',
          likes: 0,
          comments: 0,
          shares: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const formattedPost: SocialPost = {
        id: newPost.id,
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        avatar_url: user.user_metadata?.avatar_url,
        content: newPostContent,
        likes: 0,
        comments: 0,
        shares: 0,
        created_at: newPost.created_at,
        type: 'general'
      };

      setPosts(prev => [formattedPost, ...prev]);
      setNewPostContent("");
      setShowNewPost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('social.justNow');
    if (diffInMinutes < 60) return t('social.minutesAgo', { minutes: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('social.hoursAgo', { hours: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('social.daysAgo', { days: diffInDays });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'collection': return <Star className="h-4 w-4 text-blue-500" />;
      case 'wishlist': return <Heart className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="pixel-card animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Post */}
      {user && (
        <Card className="pixel-card">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {showNewPost ? (
                  <div className="space-y-3">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={t('social.whatsOnYourMind')}
                      className="w-full p-3 border-2 border-black rounded-lg resize-none pixel-input"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={createPost}
                        disabled={!newPostContent.trim()}
                        className="pixel-button"
                      >
                        {t('social.post')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowNewPost(false)}
                        className="pixel-button-secondary"
                      >
                        {t('social.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowNewPost(true)}
                    variant="outline"
                    className="w-full justify-start text-muted-foreground pixel-button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('social.createPost')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="pixel-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.avatar_url} />
                    <AvatarFallback>
                      {post.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.username}</span>
                      {getTypeIcon(post.type)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(post.created_at)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="pixel-button-small">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{post.content}</p>
              
              {post.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt="Post image"
                    className="w-full h-48 object-cover pixelated"
                  />
                </div>
              )}

              {post.card_name && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{post.card_name}</span>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-2 border-t-2 border-black">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="pixel-button-small"
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.likes > 0 ? 'text-red-500 fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="pixel-button-small">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id)}
                    className="pixel-button-small"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card className="pixel-card">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('social.noPosts')}</h3>
            <p className="text-muted-foreground">{t('social.noPostsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialFeed; 