import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { League } from './LeagueData';
import { getStatusColor, getSportColor, formatDateDisplay } from './LeagueStatusUtils';

interface LeagueItemProps {
  league: League;
  onClick: (url: string) => void;
}

export const LeagueItem: React.FC<LeagueItemProps> = ({ league, onClick }) => {
  return (
    <div 
      className="border-b border-border pb-3 last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
      onClick={() => onClick(league.url)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium">{league.name}</h4>
          <Badge variant="outline" className={`text-xs ${getSportColor(league.sport)}`}>
            {league.sport}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(league.status || 'Finished')}`}></div>
          <span className="text-xs text-muted-foreground">{league.status}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      
      {league.country && (
        <div className="text-xs text-muted-foreground mb-1">
          {league.country}
        </div>
      )}
      
      {league.startDate && league.endDate && (
        <div className="text-xs text-muted-foreground">
          {league.status === 'Active' 
            ? `Ends: ${formatDateDisplay(league.endDate, league.status || '')}`
            : league.status === 'Upcoming'
            ? `Starts: ${formatDateDisplay(league.startDate, league.status || '')}`
            : `Ended: ${formatDateDisplay(league.endDate, league.status || '')}`
          }
        </div>
      )}
    </div>
  );
};
