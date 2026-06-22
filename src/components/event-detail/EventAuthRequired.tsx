import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface EventAuthRequiredProps {
  onGoToLogin: () => void;
}

export const EventAuthRequired: React.FC<EventAuthRequiredProps> = ({
  onGoToLogin
}) => {
  return (
    <div className="animate-fade-in-up">
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to view event details.</p>
          <Button onClick={onGoToLogin}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
