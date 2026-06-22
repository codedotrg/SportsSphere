import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BackButton } from '@/components/navigation/BackButton';

interface MessagesHeaderProps {
  onNewMessage: () => void;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({ onNewMessage }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <BackButton fallbackPath="/dashboard" />
        <div>
          <h1 className="text-3xl font-bold">Direct Messages</h1>
          <p className="text-muted-foreground">
            Private conversations with other players
          </p>
        </div>
      </div>
      <Button onClick={onNewMessage}>
        <Plus className="mr-2 h-4 w-4" />
        New Message
      </Button>
    </div>
  );
};
