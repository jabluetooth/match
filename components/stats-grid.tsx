"use client";

import { TrendingUp, FileText, Calendar, Gift } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalMatches: number;
    activeApplications: number;
    interviews: number;
    offers: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      name: "Job Matches",
      value: stats.totalMatches,
      icon: TrendingUp,
      color: "bg-blue-500",
      description: "High-quality matches (70%+)",
    },
    {
      name: "Active Applications",
      value: stats.activeApplications,
      icon: FileText,
      color: "bg-purple-500",
      description: "In progress",
    },
    {
      name: "Upcoming Interviews",
      value: stats.interviews,
      icon: Calendar,
      color: "bg-green-500",
      description: "Scheduled",
    },
    {
      name: "Offers",
      value: stats.offers,
      icon: Gift,
      color: "bg-yellow-500",
      description: "Received",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.name}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
