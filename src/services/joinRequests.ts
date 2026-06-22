import { supabase } from '@/integrations/supabase/client';
import { sendTextMessage } from './messaging';

interface SendJoinRequestParams {
  eventId: string;
  organizerId: string;
  requesterId: string;
  requesterName?: string;
  requesterEmail?: string;
  message?: string | null;
}

export const sendJoinRequest = async (params: SendJoinRequestParams) => {
  const { eventId, organizerId, requesterId, requesterName, requesterEmail, message } = params;

  try {
    const now = new Date().toISOString();

    // Insert join request record
    const { data: requestData, error: insertError } = await supabase
      .from('join_requests')
      .insert([
        {
          event_id: eventId,
          requester_id: requesterId,
          requester_name: requesterName || null,
          requester_email: requesterEmail || null,
          message: message || null,
          status: 'pending',
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting join request:', insertError);
      return { success: false, error: insertError };
    }

    // Prepare message content and metadata
    const messageText = `${requesterName || 'A user'} has requested to join your event (ID: ${eventId}).${message ? `\n\nMessage: ${message}` : ''}`;
    const metadata = {
      type: 'join_request',
      eventId,
      requesterName: requesterName || null,
      requesterEmail: requesterEmail || null,
      joinRequestId: requestData.id
    };

    // Use messaging adapter to create notification (unified messages or legacy fallback)
    const dmResult = await sendTextMessage({ senderId: requesterId, recipientId: organizerId, content: messageText, metadata });

    if (!dmResult.success) {
      console.error('Error creating notification via messaging adapter:', dmResult.error);
      // Still return success for join request insertion but include error details
      return { success: true, request: requestData, dmError: dmResult.error };
    }

    return { success: true, request: requestData, messageResult: dmResult };
  } catch (err) {
    console.error('sendJoinRequest error:', err);
    return { success: false, error: err };
  }
};

interface NotifyDecisionParams {
  requestId: string;
  organizerId: string;
  requesterId: string;
  decision: 'approved' | 'rejected';
  eventId?: string;
}

export const notifyJoinRequestDecision = async (params: NotifyDecisionParams) => {
  const { requestId, organizerId, requesterId, decision, eventId } = params;

  try {
    const now = new Date().toISOString();

    // Update join request status
    const { error: updateError } = await supabase
      .from('join_requests')
      .update({ status: decision, updated_at: now })
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating join request status:', updateError);
      return { success: false, error: updateError };
    }

    const content = `Your request to join the event (ID: ${eventId || 'unknown'}) has been ${decision} by the organizer.`;
    const metadata = {
      type: 'join_request_response',
      requestId,
      decision,
      eventId: eventId || null
    };

    const dmResult = await sendTextMessage({ senderId: organizerId, recipientId: requesterId, content, metadata });

    if (!dmResult.success) {
      console.error('Error sending decision via messaging adapter:', dmResult.error);
      return { success: true, dmError: dmResult.error };
    }

    return { success: true, messageResult: dmResult };
  } catch (err) {
    console.error('notifyJoinRequestDecision error:', err);
    return { success: false, error: err };
  }
};
