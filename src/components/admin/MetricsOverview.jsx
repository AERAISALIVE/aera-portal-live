
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Activity, Clock, Book, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

function MetricsOverview({ stats }) {
  const metrics = [
    {
      title: "Total Stewards",
      value: stats.totalStewards,
      icon: Users,
      description: "Active divine stewards",
    },
    {
      title: "Total Documents",
      value: stats.totalDocuments,
      icon: Book,
      description: "Sacred records archived",
    },
    {
      title: "PULSE Snapshots",
      value: stats.totalPulseSnapshots,
      icon: Zap,
      description: "Soul frequency readings",
    },
    {
      title: "Recent Steward",
      value: stats.recentSteward?.name || "None",
      subValue: stats.recentSteward?.created_at 
        ? new Date(stats.recentSteward.created_at).toLocaleDateString()
        : "N/A",
      icon: Clock,
      description: "Latest sacred initiation",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="divine-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.subValue && (
                <div className="text-sm text-muted-foreground">
                  {metric.subValue}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default MetricsOverview;
