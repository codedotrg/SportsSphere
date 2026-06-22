import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendJoinRequest } from '@/services/joinRequests';

interface EventJoinRequestButtonProps {
  eventId?: string;
  organizerId?: string;
  isOrganizer: boolean;
  isParticipant: boolean;
  hasJoinRequest: boolean;
  onSendJoinRequest?: (message: string) => Promise<void>;
}

export const EventJoinRequestButton: React.FC<EventJoinRequestButtonProps> = ({
  eventId,
  organizerId,
  isOrganizer,
  isParticipant,
  hasJoinRequest,
  onSendJoinRequest
}) => {
  const [showJoinRequestForm, setShowJoinRequestForm] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [localPending, setLocalPending] = useState(false);

  const handleEventJoinRequest = async () => {
    if (sending) return;
    setSending(true);

    try {
      if (onSendJoinRequest) {
        await onSendJoinRequest(joinMessage);
        toast({ title: 'Request sent', description: 'Your join request was sent.' });
      } else {
        // Use built-in service
        if (!eventId || !organizerId || !user) {
          toast({ title: 'Error', description: 'Missing event, organizer, or user information', variant: 'destructive' });
          setSending(false);
          return;
        }

        const result = await sendJoinRequest({
          eventId,
          organizerId,
          requesterId: user.id,
          requesterName: user.user_metadata?.full_name || user.email?.split('@')[0],
          requesterEmail: user.email,
          message: joinMessage
        });

        if (result.success) {
          toast({ title: 'Request sent', description: 'Organizer has been notified.' });
          setLocalPending(true);
        } else {
          toast({ title: 'Error', description: 'Failed to send join request', variant: 'destructive' });
          console.error(result.error || result);
        }
      }

      setJoinMessage('');
      setShowJoinRequestForm(false);
    } finally {
      setSending(false);
    }
  };

  // Hide button for organizers and participants
  if (isOrganizer || isParticipant) return null;

  const isPending = hasJoinRequest || localPending;

  return (
    <>
      {!isPending ? (
        <Button onClick={() => setShowJoinRequestForm(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Request to Join Event
        </Button>
      ) : (
        <Button variant="outline" disabled>
          <MessageCircle className="mr-2 h-4 w-4" />
          Request Pending
        </Button>
      )}

      {showJoinRequestForm && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Request to Join Event</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Optional message to event organizer..."
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows={3}
              />
              <div className="flex space-x-2">
                <Button onClick={handleEventJoinRequest} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Request'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowJoinRequestForm(false);
                    setJoinMessage('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
