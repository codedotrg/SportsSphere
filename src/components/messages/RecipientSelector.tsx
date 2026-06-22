import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UserProfileModal } from '@/components/user/UserProfileModal';

interface User {
  id: string;
  full_name: string;
  email: string;
  location?: string;
}

interface RecipientSelectorProps {
  selectedRecipient: User | null;
  onRecipientSelect: (user: User) => void;
  onRecipientClear: () => void;
  preSelectedRecipientId?: string;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  selectedRecipient,
  onRecipientSelect,
  onRecipientClear,
  preSelectedRecipientId
}) => {
  const { users, searchTerm, setSearchTerm } = useUserSearch();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleSelectUser = (user: User) => {
    onRecipientSelect(user);
    setSearchTerm('');
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  if (selectedRecipient) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {selectedRecipient.full_name?.charAt(0) || selectedRecipient.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">To: {selectedRecipient.full_name || 'Unknown User'}</div>
            <div className="text-sm text-muted-foreground">{selectedRecipient.email}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewProfile(selectedRecipient.id)}
          >
            <User className="h-4 w-4" />
          </Button>
          {!preSelectedRecipientId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRecipientClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="search">Search for a user</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchTerm && users.length > 0 && (
          <div className="border rounded-lg max-h-60 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 flex items-center justify-between"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {user.location && (
                    <div className="text-xs text-muted-foreground">{user.location}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewProfile(user.id)}
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchTerm && users.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No users found matching "{searchTerm}"
          </div>
        )}
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
