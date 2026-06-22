import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendTextMessage } from '@/services/messaging';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileHeader } from './UserProfileHeader';
import { UserStats } from './UserStats';
import { UserDetails } from './UserDetails';
import { UserMessageForm } from './UserMessageForm';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  location?: string;
  date_of_birth?: string;
  gender?: string;
  created_at?: string;
}

interface UserStatsData {
  eventsCreated: number;
  eventsJoined: number;
  followersCount: number;
  followingCount: number;
}

interface UserProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStatsData>({
    eventsCreated: 0,
    eventsJoined: 0,
    followersCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const fetchProfile = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user stats
      const [eventsCreated, eventsJoined, followers, following] = await Promise.all([
        supabase
          .from('events')
          .select('id')
          .eq('organizer_id', userId),
        supabase
          .from('event_participants')
          .select('id')
          .eq('player_id', userId),
        supabase
          .from('user_follows')
          .select('id')
          .eq('following_id', userId),
        supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
      ]);

      setUserStats({
        eventsCreated: eventsCreated.data?.length || 0,
        eventsJoined: eventsJoined.data?.length || 0,
        followersCount: followers.data?.length || 0,
        followingCount: following.data?.length || 0
      });

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!profile) return false;

    try {
      // Use the messaging service compatibility wrapper.
      // sendTextMessage(content, authorId?, recipientId?, type?, extraMetadata?)
      await sendTextMessage(content, user?.id, profile.id, 'direct', {
        authorName: (user as any)?.user_metadata?.full_name ?? (user as any)?.email,
      });

      toast({
        title: "Message sent",
        description: `Message sent to ${profile.full_name || profile.email}`
      });

      return true;
    } catch (err) {
      console.error('Error sending direct message:', err);
      toast({
        title: 'Failed to send',
        description: 'Could not send the direct message. Try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const isCurrentUser = user?.id === userId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[90vh]' : 'max-w-2xl max-h-[90vh]'} overflow-y-auto ${isMobile ? 'mx-2' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-base sm:text-lg">
            <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : profile ? (
          <div className="space-y-4 sm:space-y-6">
            <UserProfileHeader
              profile={profile}
              isCurrentUser={isCurrentUser}
              onMessageClick={() => setShowMessageForm(!showMessageForm)}
            />

            <UserStats {...userStats} />

            <UserDetails profile={profile} />

            {showMessageForm && !isCurrentUser && (
              <UserMessageForm
                recipientName={profile.full_name || profile.email}
                onSendMessage={handleSendMessage}
                onCancel={() => setShowMessageForm(false)}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
