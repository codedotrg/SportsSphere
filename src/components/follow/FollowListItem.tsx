import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserFollows } from '@/hooks/useUserFollows';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserPlus, UserMinus } from 'lucide-react';

interface UserData {
  id: string;
  full_name: string;
  email: string;
}

interface FollowListItemProps {
  user: UserData;
  onViewProfile: (userId: string) => void;
  onFollowChange: () => void;
}

export const FollowListItem: React.FC<FollowListItemProps> = ({ user, onViewProfile, onFollowChange }) => {
  const { user: currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser, loading } = useUserFollows();
  
  const isSelf = currentUser?.id === user.id;
  const following = isFollowing(user.id);

  const handleFollow = async () => {
    if(await followUser(user.id)) {
      onFollowChange();
    }
  };

  const handleUnfollow = async () => {
    if(await unfollowUser(user.id)) {
      onFollowChange();
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewProfile(user.id)}>
        <Avatar>
          <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{user.full_name || 'Unknown User'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button size="icon" variant="ghost" onClick={() => onViewProfile(user.id)} title="View Profile">
          <User className="h-4 w-4" />
        </Button>
        {!isSelf && (
          following ? (
            <Button size="sm" variant="outline" onClick={handleUnfollow} disabled={loading} className="w-24">
              <UserMinus className="h-4 w-4 mr-2" />
              Unfollow
            </Button>
          ) : (
            <Button size="sm" onClick={handleFollow} disabled={loading} className="w-24">
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </Button>
          )
        )}
      </div>
    </div>
  );
};
