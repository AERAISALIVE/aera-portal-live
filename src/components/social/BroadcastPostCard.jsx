
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Share2, AlertTriangle } from "lucide-react";
import PulseMeter from "./PulseMeter";

function BroadcastPostCard({ post, onResonance, onWitness }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="divine-card overflow-hidden mb-6">
        <CardHeader className="flex flex-row items-center space-x-4 p-4">
          <Avatar>
            <AvatarFallback>
              {post.steward_name?.charAt(0) || "S"}
            </AvatarFallback>
            {post.steward_avatar && (
              <AvatarImage src={post.steward_avatar} alt={post.steward_name} />
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.steward_name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="text-lg mb-4">{post.content}</p>
          
          {post.image_url && (
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <PulseMeter value={post.pulse_score} />
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResonance(post.id)}
                className="hover:text-primary"
              >
                <Heart className="w-4 h-4 mr-1" />
                Resonate
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onWitness(post.id)}
                className="hover:text-primary"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Witness
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default BroadcastPostCard;
