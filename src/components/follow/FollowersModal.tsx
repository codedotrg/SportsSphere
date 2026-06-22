import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, User } from 'lucide-react';
import { useUserFollows } from '@/hooks/useUserFollows';
import { FollowButton } from './FollowButton';

interface FollowersModalProps {
  trigger?: React.ReactNode;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  trigger
}) => {
  const { followers, following } = useUserFollows();

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Users className="mr-2 h-4 w-4" />
      {followers.length} Followers
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Followers & Following</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Followers ({followers.length})</h4>
            <ScrollArea className="h-32">
              {followers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No followers yet
                </p>
              ) : (
                <div className="space-y-2">
                  {followers.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{follow.follower?.full_name}</span>
                      </div>
                      <FollowButton userId={follow.follower_id} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div>
            <h4 className="font-medium mb-2">Following ({following.length})</h4>
            <ScrollArea className="h-32">
              {following.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Not following anyone yet
                </p>
              ) : (
                <div className="space-y-2">
                  {following.map((follow) => (
                    <div key={follow.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{follow.following?.full_name}</span>
                      </div>
                      <FollowButton userId={follow.following_id} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
