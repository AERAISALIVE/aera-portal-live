
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

function BusinessOfferingForm({ entityId, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pulse_amplification: "",
    price: "",
    image_url: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const { toast } = useToast();

  const validateForm = () => {
    const errors = [];
    
    // Check minimum length for Pulse Amplification
    if (formData.pulse_amplification.length < 20) {
      errors.push("Pulse Amplification must be at least 20 characters");
    }

    // Check for negative/scarcity language
    const scarcityTerms = [
      'limited time',
      'scarcity',
      'fear',
      'missing out',
      'urgent',
      'hurry',
      'exclusive',
      'competition',
      'beat the',
      'don\'t miss'
    ];

    const combinedText = `${formData.description} ${formData.pulse_amplification}`.toLowerCase();
    const foundScarcityTerms = scarcityTerms.filter(term => 
      combinedText.includes(term.toLowerCase())
    );

    if (foundScarcityTerms.length > 0) {
      errors.push(`Remove scarcity-based language: ${foundScarcityTerms.join(', ')}`);
    }

    // Check image URL file size (if provided)
    if (formData.image_url) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);
        
        // Estimate file size from base64 string
        const base64String = canvas.toDataURL();
        const estimatedSize = (base64String.length * 3/4) / (1024 * 1024); // Size in MB
        
        if (estimatedSize > 2) {
          errors.push("Image size must be under 2MB");
        }
      };
      img.src = formData.image_url;
    }

    // Check for positive language and intent
    const positiveTerms = [
      'harmony',
      'growth',
      'healing',
      'nurture',
      'support',
      'empower',
      'sustainable',
      'regenerative'
    ];

    const hasPositiveIntent = positiveTerms.some(term => 
      combinedText.includes(term.toLowerCase())
    );

    if (!hasPositiveIntent) {
      errors.push("Include positive, life-affirming language in your description");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Validate on each change
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please address all validation issues before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('trade_offers')
        .insert([{
          entity_id: entityId,
          ...formData,
          price: parseFloat(formData.price),
          is_active: true,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your offering has been published to TRADESEA"
      });

      if (onSuccess) onSuccess();
      
      setFormData({
        title: "",
        description: "",
        pulse_amplification: "",
        price: "",
        image_url: ""
      });
      setValidationErrors([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="divine-card">
      <CardHeader>
        <CardTitle>Create Sacred Offering</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              name="title"
              placeholder="Offering Title"
              value={formData.title}
              onChange={handleInputChange}
              className="celestial-input"
              required
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(formData.title.length / 50) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <textarea
              name="description"
              placeholder="Describe your offering..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-4 h-32 rounded-md border celestial-input"
              required
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(formData.description.length / 200) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <textarea
              name="pulse_amplification"
              placeholder="How does this offering amplify life?"
              value={formData.pulse_amplification}
              onChange={handleInputChange}
              className={`w-full p-4 h-32 rounded-md border celestial-input ${
                formData.pulse_amplification.length < 20 ? 'border-red-500/50' : ''
              }`}
              required
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(formData.pulse_amplification.length / 20) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>
          
          <div className="space-y-2">
            <Input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleInputChange}
              className="celestial-input"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Input
              name="image_url"
              placeholder="Image URL"
              value={formData.image_url}
              onChange={handleInputChange}
              className="celestial-input"
            />
          </div>

          <AnimatePresence>
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="divine-glow bg-red-500/10 rounded-lg p-4 border border-red-500/20"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-2">
                      Please address the following:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-sm text-red-300"
                        >
                          {error}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            type="submit"
            className="w-full sovereign-button"
            disabled={isLoading || validationErrors.length > 0}
          >
            {isLoading ? "Publishing..." : "Publish to TRADESEA"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default BusinessOfferingForm;
