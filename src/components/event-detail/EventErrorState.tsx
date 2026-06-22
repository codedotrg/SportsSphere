import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface EventErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onBackToEvents: () => void;
}

export const EventErrorState: React.FC<EventErrorStateProps> = ({
  error,
  onRetry,
  onBackToEvents
}) => {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <Button variant="outline" onClick={onBackToEvents}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-destructive">
            {error?.toLowerCase().includes('not found') ? 'Event Not Found' : 'Error Loading Event'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || 'The event you are looking for does not exist.'}
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onBackToEvents}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
