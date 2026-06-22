import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useToast } from '@/hooks/use-toast';
import { validateMessageContent } from '@/utils/inputValidation';

interface InlineReplyFormProps {
  recipientId: string;
  onMessageSent: () => void;
}

export const InlineReplyForm: React.FC<InlineReplyFormProps> = ({ recipientId, onMessageSent }) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendDirectMessage } = useDirectMessages('sent');
  const { toast } = useToast();

  const handleSend = async () => {
    const validation = validateMessageContent(content);
    if (!validation.isValid) {
      toast({ title: "Invalid Message", description: validation.errors[0], variant: "destructive" });
      return;
    }

    setIsSending(true);
    const success = await sendDirectMessage(recipientId, content);
    if (success) {
      setContent('');
      toast({ title: "Success", description: "Message sent!" });
      onMessageSent();
    }
    setIsSending(false);
  };

  return (
    <div className="p-4 bg-background border rounded-lg mt-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Write a reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full"
        />
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={isSending || !content.trim()}>
            {isSending ? 'Sending...' : 'Send'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
