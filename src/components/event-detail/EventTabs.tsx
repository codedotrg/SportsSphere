import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Calendar } from 'lucide-react';
import { EventDetails } from '@/components/events/EventDetails';
import { TeamFormation } from '@/components/events/TeamFormation';
import { EventMessaging } from '@/components/events/EventMessaging';
import { PlayerRating } from '@/components/events/PlayerRating';
import { useToast } from '@/components/ui/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  event_date: string;
  organizer_id: string;
  created_at: string;
}

interface Participant {
  id: string;
  player_id: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

interface EventTabsProps {
  event: Event;
  isOrganizer: boolean;
  isParticipant: boolean;
  participants: Participant[];
  userId?: string;
}

export const EventTabs: React.FC<EventTabsProps> = ({
  event,
  isOrganizer,
  isParticipant,
  participants,
  userId
}) => {
  const { toast } = useToast();

  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="ratings" disabled={!isParticipant}>
          Rate Players
        </TabsTrigger>
        <TabsTrigger value="announcements">Announcements</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <EventDetails event={event} />
      </TabsContent>

      <TabsContent value="teams" className="space-y-6">
        <TeamFormation 
          eventId={event.id}
          isOrganizer={isOrganizer}
          participants={participants}
        />
      </TabsContent>

      <TabsContent value="messages" className="space-y-6">
        {isParticipant || isOrganizer ? (
          <EventMessaging 
            eventId={event.id}
            organizerId={event.organizer_id}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need to be a participant of this event to access messages.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="ratings" className="space-y-6">
        {isParticipant ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Your Fellow Players</h3>
            {participants.filter(p => p.player_id !== userId).length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No other players to rate in this event.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participants
                  .filter(p => p.player_id !== userId)
                  .map((participant) => (
                    <PlayerRating
                      key={participant.id}
                      player={{
                        id: participant.player_id,
                        full_name: participant.profile?.full_name || 'Unknown Player',
                        email: participant.profile?.email || ''
                      }}
                      eventId={event.id}
                      onRatingSubmitted={() => {
                        toast({
                          title: "Success",
                          description: "Rating submitted successfully!"
                        });
                      }}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                You need to be a participant of this event to rate other players.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="announcements" className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Event announcements feature will be available soon!
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
