import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { InlineReplyForm } from './InlineReplyForm';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationViewProps {
  conversation: any;
  replyToUserId: string;
  onBack: () => void;
  onReplySuccess: () => void;
  onMarkAsRead: (messageId: string) => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  replyToUserId,
  onBack,
  onReplySuccess,
  onMarkAsRead
}) => {
  const [showReply, setShowReply] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (conversation && user && conversation.recipient_id === user.id && !conversation.is_read) {
      onMarkAsRead(conversation.id);
    }
  }, [conversation, user, onMarkAsRead]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Conversation with {conversation.otherUser?.full_name || 'Unknown User'}
          </h1>
          <p className="text-muted-foreground">
            {conversation.otherUser?.email}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Message</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowReply(!showReply)}>
            <Send className="mr-2 h-4 w-4" />
            {showReply ? 'Cancel' : 'Reply'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{conversation.content}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <Clock className="mr-1 h-3 w-3" />
                {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReply && (
        <InlineReplyForm
          recipientId={replyToUserId}
          onMessageSent={() => {
            setShowReply(false);
            onReplySuccess();
          }}
        />
      )}
    </div>
  );
};
