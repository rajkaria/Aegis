import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DiscoveryEvent } from "@/lib/aegis-data";

interface DiscoveryFeedProps {
  events: DiscoveryEvent[];
}

export function DiscoveryFeed({ events }: DiscoveryFeedProps) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Agent Discovery
          <Badge variant="outline" className="text-xs">via XMTP</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50">
              <Badge variant="secondary" className="shrink-0 text-xs">
                {e.type === "service_announcement" ? "ANNOUNCE" : e.type === "service_query" ? "DISCOVER" : "RESPOND"}
              </Badge>
              <div className="min-w-0">
                <span className="font-medium">{e.agentId}</span>
                <span className="text-muted-foreground"> {e.detail}</span>
              </div>
              <time className="text-xs text-muted-foreground shrink-0 ml-auto">
                {new Date(e.timestamp).toLocaleTimeString()}
              </time>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
