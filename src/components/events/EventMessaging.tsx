import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMessageComposer } from '@/components/messaging/EnhancedMessageComposer';
import { fetchMessages, subscribeToMessages, sendMessage as sendMessageService, Message as ServiceMessage } from '@/services/messaging';

interface EventMessagingProps {
  eventId: string;
  organizerId: string;
}

export const EventMessaging: React.FC<EventMessagingProps> = ({ eventId, organizerId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ServiceMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchMessages({ limit: 100 });
        setMessages(res.messages.filter((m) => (m.metadata?.eventId ?? eventId) === eventId));
      } catch (err) {
        // keep fail-safe behavior
        console.warn('Failed to load messages', err);
      } finally {
        setLoading(false);
      }

      // subscribe to live updates
      unsub = subscribeToMessages((m) => {
        // only include messages for this event
        if ((m.metadata?.eventId ?? eventId) === eventId) {
          setMessages((prev) => [...prev, m]);
        }
      });
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [eventId]);

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!user || !content.trim()) return false;

    try {
      const msg: Partial<ServiceMessage> = {
        authorId: user.id,
        content: content.trim(),
        metadata: {
          eventId,
          message_type: 'general',
          attachments: attachments?.length ? true : false,
          // if not organizer, include recipient as organizer
          recipientId: user.id === organizerId ? undefined : organizerId,
        },
      };

      const sent = await sendMessageService(msg as ServiceMessage);
      // append local optimistic result if needed
      setMessages((prev) => [...prev, sent]);
      return true;
    } catch (err) {
      console.error('Failed to send message', err);
      return false;
    }
  };

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

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
            messages.map((message) => (
              <div
                key={message.id ?? `${message.authorId}-${message.createdAt ?? ''}`}
                className={`border rounded-lg p-3 ${
                  message.authorId === user?.id ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {message.authorId === user?.id ? 'You' : (message.metadata?.authorName ?? 'User')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {message.metadata?.message_type ?? 'Message'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.metadata?.recipientId && message.authorId !== user?.id && (
                  <p className="text-xs text-muted-foreground mt-1">
                    To: {message.metadata?.recipientName ?? message.metadata?.recipientId}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Send Message */}
        <div className="border-t pt-4">
          <div className="mb-2">
            <p className="text-xs text-muted-foreground">
              {user?.id === organizerId ? 'Broadcast to all participants' : 'Message will be sent to event organizer'}
            </p>
          </div>
          <EnhancedMessageComposer onSendMessage={handleSendMessage} placeholder="Type your message to the event..." />
        </div>
      </CardContent>
    </Card>
  );
};

export default EventMessaging;
