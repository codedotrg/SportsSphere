import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, MessageCircle } from 'lucide-react';

interface EventJoinRequestButtonProps {
  isOrganizer: boolean;
  isParticipant: boolean;
  hasJoinRequest: boolean;
  onSendJoinRequest: (message: string) => Promise<void>;
}

export const EventJoinRequestButton: React.FC<EventJoinRequestButtonProps> = ({
  isOrganizer,
  isParticipant,
  hasJoinRequest,
  onSendJoinRequest
}) => {
  const [showJoinRequestForm, setShowJoinRequestForm] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleEventJoinRequest = async () => {
    setSending(true);
    try {
      await onSendJoinRequest(joinMessage);
      setJoinMessage('');
      setShowJoinRequestForm(false);
    } finally {
      setSending(false);
    }
  };

  // Hide button for organizers and participants
  if (isOrganizer || isParticipant) return null;

  return (
    <>
      {/* Join Event Request Button */}
      {!hasJoinRequest ? (
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

      {/* Join Request Form */}
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
