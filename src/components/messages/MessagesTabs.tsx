import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessagesTabsProps {
  inboxConversations: any[];
  sentConversations: any[];
  inboxLoading: boolean;
  sentLoading: boolean;
  onConversationClick: (conversation: any) => void;
}

export const MessagesTabs: React.FC<MessagesTabsProps> = ({
  inboxConversations,
  sentConversations,
  inboxLoading,
  sentLoading,
  onConversationClick
}) => {
  const renderConversations = (conversations: any[], loading: boolean) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground mt-2">Loading messages...</p>
        </div>
      );
    }

    if (conversations.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground mt-2">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`border rounded-lg p-4 hover:bg-muted/50 cursor-pointer ${
              !conversation.is_read ? 'bg-primary/5 border-primary/20' : ''
            }`}
            onClick={() => onConversationClick(conversation)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {conversation.otherUser?.full_name || conversation.otherUser?.email || 'Unknown User'}
                </span>
                {!conversation.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {conversation.content}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="inbox" className="space-y-6">
      <TabsList>
        <TabsTrigger value="inbox">Inbox</TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
      </TabsList>

      <TabsContent value="inbox">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Messages you've received</CardDescription>
          </CardHeader>
          <CardContent>
            {renderConversations(inboxConversations, inboxLoading)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sent">
        <Card>
          <CardHeader>
            <CardTitle>Sent Messages</CardTitle>
            <CardDescription>Messages you've sent</CardDescription>
          </CardHeader>
          <CardContent>
            {renderConversations(sentConversations, sentLoading)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
