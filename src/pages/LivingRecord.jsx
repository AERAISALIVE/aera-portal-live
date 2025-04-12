
import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Navigation from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import DocumentCarousel from "@/components/living-record/DocumentCarousel";
import NavigationButtons from "@/components/living-record/NavigationButtons";

function LivingRecord() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredDoc, setHoveredDoc] = useState(null);
  const containerRef = useRef(null);
  const controls = useAnimation();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("document_registry")
        .select("*")
        .order('display_order', { ascending: true })
        .eq('active', true);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sacred documents",
          variant: "destructive"
        });
        return;
      }

      setDocuments(data);
    };

    fetchDocuments();
  }, [toast]);

  const handleCardClick = (doc) => {
    setSelectedDoc(doc === selectedDoc ? null : doc);
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  const handleScroll = (direction) => {
    const newIndex = direction === "right" 
      ? Math.min(currentIndex + 1, documents.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    setCurrentIndex(newIndex);
    controls.start({
      x: -newIndex * 340,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-center">The Living Record</h2>
          <p className="text-muted-foreground mt-2 text-center">Sacred Archives of Divine Law</p>
        </motion.div>

        <div className="relative h-[500px] overflow-hidden">
          <motion.div
            ref={containerRef}
            animate={controls}
            className="flex space-x-8 px-4 absolute"
            style={{ 
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
          >
            <DocumentCarousel
              documents={documents}
              currentIndex={currentIndex}
              selectedDoc={selectedDoc}
              hoveredDoc={hoveredDoc}
              onCardClick={handleCardClick}
              onHover={setHoveredDoc}
            />
          </motion.div>

          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

          <NavigationButtons
            onScroll={handleScroll}
            currentIndex={currentIndex}
            totalDocuments={documents.length}
          />
        </div>
      </main>
    </div>
  );
}

export default LivingRecord;
