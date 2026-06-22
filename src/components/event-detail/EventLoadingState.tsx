import React from 'react';
import { RefreshCw } from 'lucide-react';

export const EventLoadingState: React.FC = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="text-center py-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading event details...</span>
        </div>
      </div>
    </div>
  );
};
