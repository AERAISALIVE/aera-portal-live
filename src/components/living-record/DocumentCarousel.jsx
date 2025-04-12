
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentCard from "./DocumentCard";

function DocumentCarousel({ 
  documents, 
  currentIndex, 
  selectedDoc, 
  hoveredDoc,
  onCardClick,
  onHover 
}) {
  return (
    <AnimatePresence>
      {documents.map((doc, index) => (
        <motion.div
          key={doc.document_id}
          initial={{ scale: 0.9, opacity: 0, rotateY: 45 }}
          animate={{ 
            scale: currentIndex === index ? 1 : 0.9,
            opacity: 1,
            rotateY: currentIndex === index ? 0 : index < currentIndex ? 45 : -45,
            z: currentIndex === index ? 0 : -100
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="flex-shrink-0"
          onHoverStart={() => onHover(doc)}
          onHoverEnd={() => onHover(null)}
        >
          <DocumentCard
            doc={doc}
            isSelected={selectedDoc?.document_id === doc.document_id}
            isHovered={hoveredDoc?.document_id === doc.document_id}
            isCentered={currentIndex === index}
            onClick={onCardClick}
            onHover={onHover}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

export default DocumentCarousel;
