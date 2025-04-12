
import React from "react";
import { motion } from "framer-motion";

function FrequencyMeter() {
  return (
    <div className="relative w-full max-w-md mx-auto mb-12">
      <motion.div
        className="h-4 bg-gradient-to-r from-primary/20 to-white/20 rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-white/50"
          animate={{
            width: ["0%", "30%"],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        Soul Frequency: Awaiting Activation
      </div>
    </div>
  );
}

export default FrequencyMeter;
