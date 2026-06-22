import { supabase } from '@/integrations/supabase/client';

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

    // Send a direct message to the organizer so they are notified in-app
    const messageText = `${requesterName || 'A user'} has requested to join your event (ID: ${eventId}).${message ? `\n\nMessage: ${message}` : ''}`;

    const { error: dmError } = await supabase
      .from('direct_messages')
      .insert([
        {
          sender_id: requesterId,
          recipient_id: organizerId,
          content: messageText,
          metadata: {
            type: 'join_request',
            eventId,
            requesterName: requesterName || null,
            requesterEmail: requesterEmail || null,
            joinRequestId: requestData.id
          },
          is_read: false,
          created_at: now
        }
      ]);

    if (dmError) {
      console.error('Error creating direct message for join request:', dmError);
      // Don't treat DM failure as fatal — return success for join request insertion but include dmError
      return { success: true, request: requestData, dmError };
    }

    return { success: true, request: requestData };
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

    // Send notification message back to requester
    const content = `Your request to join the event (ID: ${eventId || 'unknown'}) has been ${decision} by the organizer.`;

    const { error: dmError } = await supabase
      .from('direct_messages')
      .insert([
        {
          sender_id: organizerId,
          recipient_id: requesterId,
          content,
          metadata: {
            type: 'join_request_response',
            requestId,
            decision,
            eventId: eventId || null
          },
          is_read: false,
          created_at: now
        }
      ]);

    if (dmError) {
      console.error('Error sending decision direct message:', dmError);
      return { success: true, dmError };
    }

    return { success: true };
  } catch (err) {
    console.error('notifyJoinRequestDecision error:', err);
    return { success: false, error: err };
  }
};
