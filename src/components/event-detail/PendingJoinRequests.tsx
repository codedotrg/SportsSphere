import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JoinRequest {
  id: string;
  player_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  profile?: {
    full_name: string;
    email: string;
  };
}

interface PendingJoinRequestsProps {
  isOrganizer: boolean;
  joinRequests: JoinRequest[];
  onRespondToRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<boolean>;
}

export const PendingJoinRequests: React.FC<PendingJoinRequestsProps> = ({
  isOrganizer,
  joinRequests,
  onRespondToRequest
}) => {
  const pendingRequests = joinRequests.filter(r => r.status === 'pending');

  if (!isOrganizer || pendingRequests.length === 0) return null;

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
                  onClick={() => onRespondToRequest(request.id, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRespondToRequest(request.id, 'rejected')}
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
