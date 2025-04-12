
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

function DocumentCard({ doc, isSelected, isHovered, isCentered, onHover, onClick }) {
  return (
    <Card
      onClick={() => onClick(doc)}
      className={`w-[320px] h-[450px] cursor-pointer transition-all transform-gpu ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)"
      }}
    >
      <CardContent className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
        {(doc.glow_effect || isCentered) && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
            style={{ zIndex: -1 }}
          />
        )}
        
        <motion.div
          initial={false}
          animate={isCentered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h3 className="text-2xl font-semibold mb-4 leading-tight">{doc.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {doc.description}
          </p>
        </motion.div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 bg-background/95 flex items-center justify-center"
            >
              <div className="text-center p-6">
                <h4 className="text-xl font-semibold mb-2">{doc.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary rounded-full text-sm font-medium"
                >
                  Click to Read Full Document
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            boxShadow: isSelected
              ? "0 0 30px rgba(255,255,255,0.4)"
              : "none"
          }}
          className="mt-6 h-1 bg-primary/50 rounded-full"
        />

        {isCentered && (
          <motion.div
            className="absolute inset-0 border-2 border-primary/30 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                "0 0 20px rgba(255,215,0,0.2)",
                "0 0 40px rgba(255,215,0,0.4)",
                "0 0 20px rgba(255,215,0,0.2)"
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default DocumentCard;
