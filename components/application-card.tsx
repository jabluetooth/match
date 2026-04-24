"use client";

import { Clock, MapPin } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ApplicationCardProps {
  application: {
    id: number;
    status: string;
    appliedAt: Date | null;
    job: {
      title: string;
      companyName: string;
      location: string | null;
    };
  };
  statusCss: string;
  statusLabel: string;
  onClick?: () => void;
}

export function ApplicationCard({ application, statusCss, statusLabel, onClick }: ApplicationCardProps) {
  return (
    <div className="app-card" onClick={onClick}>
      <h3 className="app-card-title">{application.job.title}</h3>
      <div className="app-card-company">{application.job.companyName}</div>
      <div className="app-card-meta">
        {application.appliedAt && (
          <span><Clock size={11} />{formatRelativeTime(application.appliedAt)}</span>
        )}
        {application.job.location && (
          <span><MapPin size={11} />{application.job.location}</span>
        )}
      </div>
      <div className={`app-card-status ${statusCss}`}>
        <span className="dot" />
        {statusLabel}
      </div>
    </div>
  );
}
