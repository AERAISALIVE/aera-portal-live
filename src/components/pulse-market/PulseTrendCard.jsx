
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

function PulseTrendCard({ entity }) {
  const navigate = useNavigate();
  
  const getLatestSnapshot = () => {
    if (!entity.pulse_entity_snapshots?.length) return null;
    return entity.pulse_entity_snapshots[0];
  };

  const getTrendIcon = () => {
    const snapshot = getLatestSnapshot();
    if (!snapshot) return null;
    return snapshot.new_score > snapshot.previous_score ? TrendingUp : TrendingDown;
  };

  const getGlowColor = () => {
    if (entity.pulse_score >= 70) return "from-yellow-500/20 to-white/20";
    if (entity.pulse_score >= 40) return "from-blue-500/20 to-white/20";
    return "from-gray-500/20 to-white/20";
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/pulse-market/${entity.id}`)}
      className="cursor-pointer"
    >
      <Card className="divine-card overflow-hidden relative">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${getGlowColor()}`}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute inset-0 border-2 border-primary/20 rounded-lg"
          animate={{
            boxShadow: [
              "0 0 20px rgba(255,215,0,0.1)",
              "0 0 40px rgba(255,215,0,0.2)",
              "0 0 20px rgba(255,215,0,0.1)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{entity.name}</CardTitle>
            {TrendIcon && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TrendIcon 
                  className={`w-5 h-5 ${
                    TrendIcon === TrendingUp ? "text-green-500" : "text-red-500"
                  }`} 
                />
              </motion.div>
            )}
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {entity.entity_type}
          </p>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">PULSE Score</span>
            <motion.span
              className="text-2xl font-bold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {entity.pulse_score}
            </motion.span>
          </div>

          <motion.div
            className="h-2 bg-secondary/50 rounded-full overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${entity.pulse_score}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {entity.description}
          </p>

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20"
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PulseTrendCard;
