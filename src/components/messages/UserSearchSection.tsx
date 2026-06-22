import React from 'react';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  full_name: string;
  email: string;
  location: string | null;
}

interface UserSearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  users: User[];
  onUserClick: (user: User, action: 'select' | 'profile') => void;
}

export const UserSearchSection: React.FC<UserSearchSectionProps> = ({
  searchTerm,
  setSearchTerm,
  users,
  onUserClick
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="recipient-search">Search for recipient</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="recipient-search"
            placeholder="Search for users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {searchTerm && users.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <Card key={user.id} className="border">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUserClick(user, 'profile')}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onUserClick(user, 'select')}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {searchTerm && users.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No users found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};
