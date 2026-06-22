import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useUserFollows } from '@/hooks/useUserFollows';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  size = 'sm',
  variant = 'default'
}) => {
  const { followUser, unfollowUser, isFollowing } = useUserFollows();
  const isCurrentlyFollowing = isFollowing(userId);

  const handleToggleFollow = async () => {
    if (isCurrentlyFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  return (
    <Button
      size={size}
      variant={isCurrentlyFollowing ? 'outline' : variant}
      onClick={handleToggleFollow}
    >
      {isCurrentlyFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
};
