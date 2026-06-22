import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { EnhancedMessageComposer } from '@/components/messaging/EnhancedMessageComposer';

interface EventMessagingProps {
  eventId: string;
  organizerId: string;
}

export const EventMessaging: React.FC<EventMessagingProps> = ({
  eventId,
  organizerId
}) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(eventId);

  const handleSendMessage = async (content: string, attachments?: File[]): Promise<boolean> => {
    if (!content.trim()) return false;

    // For now, we'll just send the text content
    // File attachment support for event messages can be added later
    // sendMessage is provided by useMessages hook — it may accept the legacy signature
    // (content, recipientId?, type?) or be migrated to accept a Message object. We keep
    // this call in the legacy shape for backward compatibility.
    const success = await sendMessage(
      content,
      user?.id === organizerId ? undefined : organizerId,
      'general'
    );

    return success;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageType = (message: any) => {
    // Support old and new message shapes:
    // - old: message.message_type
    // - new: message.metadata?.type
    if (!message) return 'Message';
    if (message.message_type) return 'Team Request' === message.message_type ? 'Team Request' : message.message_type === 'join_request' ? 'Join Request' : 'Message';
    if (message.metadata?.type) {
      if (message.metadata.type === 'team_request') return 'Team Request';
      if (message.metadata.type === 'join_request') return 'Join Request';
      return String(message.metadata.type);
    }
    return 'Message';
  };

  // helpers to normalize the message record for display without breaking
  const getSenderId = (message: any) => message?.sender_id ?? message?.authorId ?? message?.author_id;
  const getSenderName = (message: any) => {
    return message?.sender?.full_name ?? message?.sender?.name ?? message?.metadata?.authorName ?? message?.authorName ?? 'Unknown User';
  };
  const getCreatedAt = (message: any) => message?.created_at ?? message?.createdAt ?? message?.created;
  const getRecipientDisplay = (message: any) => {
    // old shape: message.recipient.full_name
    // new shape: metadata.recipientId (just id) -> caller may need to fetch profile separately
    if (message?.recipient?.full_name) return message.recipient.full_name;
    if (message?.recipient?.fullName) return message.recipient.fullName;
    if (message?.metadata?.recipientName) return message.metadata.recipientName;
    // fallback to recipient id if present
    return message?.recipient?.id ?? message?.metadata?.recipientId ?? null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex items-center justify-center space-x-2">
            <MessageCircle className="h-6 w-6 animate-pulse" />
            <span>Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          Event Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-4">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start a conversation!</p>
            </div>
          ) : (
            messages.map((message: any) => {
              const senderId = getSenderId(message);
              const createdAt = getCreatedAt(message);
              const messageTypeLabel = getMessageType(message);
              const recipientDisplay = getRecipientDisplay(message);
              const isFromMe = senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`border rounded-lg p-3 ${
                    isFromMe
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {isFromMe ? 'You' : getSenderName(message)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {messageTypeLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{createdAt ? formatDate(createdAt) : 'Unknown'}</span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content ?? message.text ?? ''}</p>
                  {recipientDisplay && !isFromMe && (
                    <p className="text-xs text-muted-foreground mt-1">
                      To: {recipientDisplay}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Send Message */}
        <div className="border-t pt-4">
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">
              {user?.id === organizerId 
                ? 'Broadcast to all participants'
                : 'Message will be sent to event organizer'
              }
            </p>
          </div>
          <EnhancedMessageComposer
            onSendMessage={handleSendMessage}
            placeholder="Type your message to the event..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
