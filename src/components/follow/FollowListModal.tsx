import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserFollows } from '@/hooks/useUserFollows';
import { FollowListItem } from './FollowListItem';
import { UserProfileModal } from '@/components/user/UserProfileModal';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'followers' | 'following';
}

export const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, initialTab }) => {
  const { followers, following, loading, refetch } = useUserFollows();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };
  
  const handleFollowChange = () => {
    refetch();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connections</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
              <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="followers">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
                {loading && <p className="text-center text-muted-foreground p-4">Loading...</p>}
                {!loading && followers.length === 0 && <p className="text-center text-muted-foreground p-4">You have no followers yet.</p>}
                {followers.map(follow => (
                  <FollowListItem 
                    key={follow.follower_id}
                    user={{ id: follow.follower_id, ...follow.follower }}
                    onViewProfile={handleViewProfile}
                    onFollowChange={handleFollowChange}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="following">
              <div className="space-y-2 max-h-[60vh] overflow-y-auto p-1">
                {loading && <p className="text-center text-muted-foreground p-4">Loading...</p>}
                {!loading && following.length === 0 && <p className="text-center text-muted-foreground p-4">You are not following anyone yet.</p>}
                {following.map(follow => (
                  <FollowListItem 
                    key={follow.following_id} 
                    user={{ id: follow.following_id, ...follow.following }}
                    onViewProfile={handleViewProfile}
                    onFollowChange={handleFollowChange}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <UserProfileModal 
        userId={selectedUserId}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
