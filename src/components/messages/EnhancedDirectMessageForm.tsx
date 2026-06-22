import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileAttachment } from './FileAttachment';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useUserSearch } from '@/hooks/useUserSearch';
import { validateMessageContent } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';
import { Search, Send, X } from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email: string;
  location?: string;
}

export const EnhancedDirectMessageForm: React.FC = () => {
  const { toast } = useToast();
  const { sendDirectMessage } = useDirectMessages('sent');
  const { users, searchTerm, setSearchTerm } = useUserSearch();
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedRecipient) {
      toast({
        title: "Error",
        description: "Please select a recipient",
        variant: "destructive"
      });
      return;
    }

    const validation = validateMessageContent(message);
    if (!validation.isValid) {
      toast({
        title: "Invalid Message",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    // Combine subject and message for content
    const fullMessage = subject ? `Subject: ${subject}\n\n${message}` : message;
    
    const success = await sendDirectMessage(selectedRecipient.id, fullMessage);
    
    if (success) {
      setMessage('');
      setSubject('');
      setSelectedRecipient(null);
      setSearchTerm('');
      setAttachments([]);
      toast({
        title: "Success",
        description: "Message sent successfully!"
      });
    }
    setSending(false);
  };

  const handleSelectUser = (user: User) => {
    setSelectedRecipient(user);
    setSearchTerm('');
  };

  const handleFilesUploaded = (filePaths: string[]) => {
    setAttachments(prev => [...prev, ...filePaths]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Enhanced Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedRecipient ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search for a user</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searchTerm && users.length > 0 && (
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="font-medium">{user.full_name || 'Unknown User'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    {user.location && (
                      <div className="text-xs text-muted-foreground">{user.location}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchTerm && users.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">To: {selectedRecipient.full_name || 'Unknown User'}</div>
                <div className="text-sm text-muted-foreground">{selectedRecipient.email}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecipient(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="Enter message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <FileAttachment onFilesUploaded={handleFilesUploaded} />

            {attachments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {attachments.length} file(s) attached
              </div>
            )}

            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
