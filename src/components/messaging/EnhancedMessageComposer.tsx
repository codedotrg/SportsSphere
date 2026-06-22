import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface EnhancedMessageComposerProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<boolean>;
  placeholder?: string;
  initialText?: string;
  disabled?: boolean;
}

/**
 * EnhancedMessageComposer
 *
 * Minimal, reusable message composer used in multiple places.
 * Keeps a simple text area and an optional (single) file input for attachments.
 *
 * Calls onSendMessage(content, attachments?) and handles local loading state.
 */
export const EnhancedMessageComposer: React.FC<EnhancedMessageComposerProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  initialText = "",
  disabled = false,
}) => {
  const [text, setText] = useState(initialText);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!text.trim() && !attachment) return;
    setSending(true);
    try {
      const success = await onSendMessage(text.trim(), attachment ? [attachment] : undefined);
      if (!success) {
        toast({
          title: "Message failed",
          description: "Could not send message. Try again.",
          variant: "destructive",
        });
      } else {
        setText("");
        setAttachment(null);
      }
    } catch (err) {
      console.error("EnhancedMessageComposer send error", err);
      toast({
        title: "Message failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        disabled={disabled || sending}
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setAttachment(file);
          }}
          className="text-sm"
          disabled={disabled || sending}
        />
        <Button onClick={handleSend} disabled={disabled || sending} className="ml-auto">
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
};
