
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

function WitnessButton({ onClick, isActive }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant={isActive ? "default" : "outline"}
        size="lg"
        onClick={onClick}
        className={`relative overflow-hidden ${
          isActive ? "bg-red-500 hover:bg-red-600" : ""
        }`}
      >
        <AlertTriangle className="w-5 h-5 mr-2" />
        {isActive ? "Cancel Witness" : "Signal Witness"}
        
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-red-400"
            animate={{
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Button>
    </motion.div>
  );
}

export default WitnessButton;
