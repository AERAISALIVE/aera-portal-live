
import React from "react";
import { motion } from "framer-motion";

function NavigationButtons({ onScroll, currentIndex, totalDocuments }) {
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onScroll("left")}
        disabled={currentIndex === 0}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-primary/90 p-4 rounded-full z-20 disabled:opacity-50"
      >
        ←
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onScroll("right")}
        disabled={currentIndex === totalDocuments - 1}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-primary/90 p-4 rounded-full z-20 disabled:opacity-50"
      >
        →
      </motion.button>
    </>
  );
}

export default NavigationButtons;
