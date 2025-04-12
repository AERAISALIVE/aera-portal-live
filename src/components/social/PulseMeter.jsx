
import React from "react";
import { motion } from "framer-motion";

function PulseMeter({ value }) {
  const pulseColor = value >= 70 ? "#4CAF50" : value >= 40 ? "#FFC107" : "#F44336";

  return (
    <div className="relative flex items-center space-x-2">
      <motion.div
        className="w-24 h-2 bg-secondary rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: pulseColor }}
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-medium"
      >
        {value}%
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: pulseColor }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

export default PulseMeter;
