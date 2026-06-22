import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { notifyJoinRequestDecision } from '@/services/joinRequests';

interface JoinRequest {
  id: string;
  player_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  profile?: {
    full_name: string;
    email: string;
  };
  event_id?: string;
}

interface PendingJoinRequestsProps {
  isOrganizer: boolean;
  joinRequests: JoinRequest[];
  onRespondToRequest?: (requestId: string, status: 'approved' | 'rejected') => Promise<boolean>;
  organizerId?: string;
}

export const PendingJoinRequests: React.FC<PendingJoinRequestsProps> = ({
  isOrganizer,
  joinRequests,
  onRespondToRequest,
  organizerId
}) => {
  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const { toast } = useToast();

  if (!isOrganizer || pendingRequests.length === 0) return null;

  const handleRespond = async (requestId: string, status: 'approved' | 'rejected', requesterId?: string, eventId?: string) => {
    if (onRespondToRequest) {
      try {
        await onRespondToRequest(requestId, status);
        toast({ title: 'Success', description: `Request ${status}` });
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to update request', variant: 'destructive' });
      }
      return;
    }

    if (!organizerId) {
      toast({ title: 'Error', description: 'Missing organizer id', variant: 'destructive' });
      return;
    }

    try {
      const result = await notifyJoinRequestDecision({ requestId, organizerId, requesterId: requesterId || '', decision: status, eventId });

      if (result.success) {
        toast({ title: 'Success', description: `Request ${status}` });
      } else {
        console.error(result.error || result);
        toast({ title: 'Error', description: 'Failed to notify requester', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to notify requester', variant: 'destructive' });
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Pending Join Requests</h3>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{request.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">{request.profile?.email}</p>
                {request.message && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Message: "{request.message}"
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleRespond(request.id, 'approved', request.player_id, request.event_id)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRespond(request.id, 'rejected', request.player_id, request.event_id)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
