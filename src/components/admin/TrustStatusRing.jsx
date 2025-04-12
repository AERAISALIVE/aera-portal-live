
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TrustStatusRing({ stats }) {
  const total = Object.values(stats.trustStatus).reduce((a, b) => a + b, 0);
  const stages = [
    { name: "Initiate", value: stats.trustStatus.initiate, color: "#FFC107" },
    { name: "Apprentice", value: stats.trustStatus.apprentice, color: "#2196F3" },
    { name: "Master", value: stats.trustStatus.master, color: "#4CAF50" },
  ];

  return (
    <Card className="divine-card">
      <CardHeader>
        <CardTitle className="text-center">Trust Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="relative w-48 h-48">
          {stages.map((stage, index) => {
            const percentage = (stage.value / total) * 100;
            const rotation = index * (360 / stages.length);
            
            return (
              <motion.div
                key={stage.name}
                className="absolute inset-0"
                initial={{ rotate: rotation, scale: 0.8, opacity: 0 }}
                animate={{ 
                  rotate: rotation,
                  scale: 1,
                  opacity: 1,
                }}
                transition={{ delay: index * 0.2 }}
              >
                <div
                  className="absolute inset-0 rounded-full border-8"
                  style={{
                    borderColor: `${stage.color}40`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + percentage}% 0%)`,
                    transform: `rotate(${percentage * 3.6}deg)`,
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                  initial={{ opacity: 0.1 }}
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {total}
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 w-full">
          {stages.map((stage) => (
            <div key={stage.name} className="text-center">
              <div className="text-lg font-bold">{stage.value}</div>
              <div 
                className="text-sm"
                style={{ color: stage.color }}
              >
                {stage.name}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default TrustStatusRing;
