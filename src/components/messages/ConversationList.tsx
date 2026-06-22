import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Send, Check, CheckCheck } from 'lucide-react';
import { UserProfileModal } from '@/components/user/UserProfileModal';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  type: 'inbox' | 'sent';
  conversations: any[];
  loading: boolean;
  onConversationClick: (conversation: any) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ type, conversations, loading, onConversationClick }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleViewProfile = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  const handleReply = (conversation: any, event: React.MouseEvent) => {
    event.stopPropagation();
    onConversationClick(conversation);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {type === 'inbox' ? 'No messages received yet' : 'No messages sent yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const otherUserId = type === 'inbox' ? conversation.sender_id : conversation.recipient_id;
          
          return (
            <Card key={conversation.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onConversationClick(conversation)}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {conversation.otherUser?.full_name?.charAt(0) || 
                       conversation.otherUser?.email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">
                        {conversation.otherUser?.full_name || conversation.otherUser?.email || 'Unknown User'}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleReply(conversation, e)}
                          title="Reply"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleViewProfile(otherUserId, e)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        {type === 'inbox' && !conversation.is_read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                        </span>
                        {type === 'sent' && (
                          conversation.is_read 
                            ? <span title="Read"><CheckCheck className="h-4 w-4 text-primary" /></span> 
                            : <span title="Sent"><Check className="h-4 w-4 text-muted-foreground" /></span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {conversation.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};
