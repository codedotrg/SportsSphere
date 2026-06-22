import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';
import { FileAttachment } from './FileAttachment';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { validateMessageContent } from '@/utils/inputValidation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  location?: string;
}

interface MessageComposerProps {
  recipient: User;
  onMessageSent?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  recipient,
  onMessageSent
}) => {
  const { toast } = useToast();
  const { sendDirectMessage } = useDirectMessages('sent');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
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
    const success = await sendDirectMessage(recipient.id, message);
    
    if (success) {
      setMessage('');
      setAttachments([]);
      toast({
        title: "Success",
        description: "Message sent successfully!"
      });
      
      onMessageSent?.();
    }
    setSending(false);
  };

  const handleFilesUploaded = (filePaths: string[]) => {
    setAttachments(prev => [...prev, ...filePaths]);
  };

  return (
    <div className="space-y-4">
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
  );
};
