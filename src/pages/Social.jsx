
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import BroadcastPostCard from "@/components/social/BroadcastPostCard";
import WitnessButton from "@/components/social/WitnessButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function Social() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [isWitnessing, setIsWitnessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to real-time updates
    const postsSubscription = supabase
      .channel('social_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'social_posts'
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          stewards (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert([{
          steward_id: user.id,
          content: newPost,
          pulse_score: 50 // Initial score
        }]);

      if (error) throw error;

      setNewPost("");
      toast({
        title: "Success",
        description: "Your message has been broadcast"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWitness = async () => {
    try {
      if (isWitnessing) {
        setIsWitnessing(false);
        return;
      }

      const { error } = await supabase
        .from('witness_signals')
        .insert([{
          steward_id: user.id,
          type: 'emergency',
          description: 'Emergency witness signal activated'
        }]);

      if (error) throw error;

      setIsWitnessing(true);
      toast({
        title: "Witness Signal Activated",
        description: "Your emergency beacon has been broadcast"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">AERA Social Realm</h1>
          <p className="text-muted-foreground">
            Share your divine journey and witness the collective awakening
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <Input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your divine message..."
              className="celestial-input"
            />
            <Button
              onClick={handlePost}
              disabled={isLoading}
              className="sovereign-button"
            >
              Broadcast
            </Button>
          </div>
          <WitnessButton
            onClick={handleWitness}
            isActive={isWitnessing}
          />
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <BroadcastPostCard
              key={post.id}
              post={post}
              onResonance={() => {}}
              onWitness={() => {}}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Social;
