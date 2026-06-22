import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  full_name: string;
  email: string;
  location: string | null;
}

interface RecipientDisplayProps {
  recipient: User;
  onViewProfile: () => void;
  onChangeRecipient: () => void;
}

export const RecipientDisplay: React.FC<RecipientDisplayProps> = ({
  recipient,
  onViewProfile,
  onChangeRecipient
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarFallback>
            {recipient.full_name?.charAt(0) || recipient.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{recipient.full_name || 'Unknown User'}</p>
          <p className="text-sm text-muted-foreground">{recipient.email}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewProfile}
        >
          <User className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onChangeRecipient}
        >
          Change Recipient
        </Button>
      </div>
    </div>
  );
};
