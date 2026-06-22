import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { sendTextMessage } from "@/services/messaging";

interface DirectMessageFormProps {
  preSelectedRecipientId?: string;
  onSent?: () => void;
  placeholder?: string;
}

/**
 * DirectMessageForm
 *
 * Simple form to send a direct message to a user. Uses the compatibility wrapper sendTextMessage(...)
 * so it will work with both old and new messaging backends.
 */
export const DirectMessageForm: React.FC<DirectMessageFormProps> = ({
  preSelectedRecipientId,
  onSent,
  placeholder = "Write your message..."
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      // sendTextMessage(content, authorId?, recipientId?, type?, extraMetadata?)
      await sendTextMessage(text.trim(), user?.id, preSelectedRecipientId, "direct", {
        authorName: (user as any)?.user_metadata?.full_name ?? (user as any)?.email,
      });

      toast({
        title: "Message sent",
        description: "Your message was delivered.",
      });

      setText("");
      onSent?.();
    } catch (err) {
      console.error("DirectMessageForm send error", err);
      toast({
        title: "Failed to send",
        description: "Could not send the direct message. Try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a Direct Message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSend} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={4}
            maxLength={2000}
          />
          <div className="flex space-x-2">
            <Button type="submit" className="ml-auto" disabled={loading || !text.trim()}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
