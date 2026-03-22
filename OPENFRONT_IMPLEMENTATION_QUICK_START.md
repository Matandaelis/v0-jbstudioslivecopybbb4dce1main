# Openfront Live Shopping - Implementation Quick Start

## Database Migration (Week 1-2)

### Step 1: Create Migration File
```bash
npm run migrate:gen -- add_live_shopping_tables
```

### Step 2: Add Keystone Models

Create `/features/keystone/live-shopping.ts`:

```typescript
import { list } from '@keystone-6/core';
import { text, timestamp, decimal, integer, checkbox, relationship, select } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';

export const LiveShoppingEvent = list({
  access: allowAll(),
  fields: {
    title: text({ validation: { isRequired: true } }),
    description: text({ db: { map: 'description' } }),
    host: relationship({ ref: 'User.hostedLiveEvents' }),
    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Live', value: 'live' },
        { label: 'Ended', value: 'ended' }
      ],
      defaultValue: 'draft'
    }),
    scheduledStart: timestamp(),
    scheduledEnd: timestamp(),
    actualStart: timestamp(),
    actualEnd: timestamp(),
    livekitRoomName: text({ isIndexed: 'unique' }),
    thumbnailUrl: text(),
    viewerCount: integer({ defaultValue: 0 }),
    totalSales: decimal({ precision: 10, scale: 2, defaultValue: '0' }),
    featuredProducts: relationship({ ref: 'LiveEventProduct.event', many: true }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ db: { updatedAt: true } })
  }
});

export const InventoryLevel = list({
  access: allowAll(),
  fields: {
    product: relationship({ ref: 'Product.inventoryLevels' }),
    warehouse: relationship({ ref: 'Warehouse.inventoryLevels' }),
    availableQuantity: integer({ defaultValue: 0, validation: { isRequired: true } }),
    reservedQuantity: integer({ defaultValue: 0 }),
    damagedQuantity: integer({ defaultValue: 0 }),
    inTransitQuantity: integer({ defaultValue: 0 }),
    lastCountedAt: timestamp(),
    updatedAt: timestamp({ db: { updatedAt: true } })
  }
});

export const StockReservation = list({
  access: allowAll(),
  fields: {
    event: relationship({ ref: 'LiveShoppingEvent.reservations' }),
    product: relationship({ ref: 'Product.reservations' }),
    warehouse: relationship({ ref: 'Warehouse.reservations' }),
    reservedQuantity: integer({ validation: { isRequired: true } }),
    reservedByUser: relationship({ ref: 'User' }),
    expiresAt: timestamp({ validation: { isRequired: true } }),
    order: relationship({ ref: 'Order' }),
    status: select({
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Converted to Order', value: 'converted_to_order' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' }
      ],
      defaultValue: 'active'
    }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } })
  }
});

export const InventoryMovement = list({
  access: allowAll(),
  fields: {
    product: relationship({ ref: 'Product.movements' }),
    warehouse: relationship({ ref: 'Warehouse.movements' }),
    movementType: select({
      options: [
        { label: 'Purchase', value: 'purchase' },
        { label: 'Sale', value: 'sale' },
        { label: 'Adjustment', value: 'adjustment' },
        { label: 'Return', value: 'return' },
        { label: 'Damage', value: 'damage' },
        { label: 'Transfer', value: 'transfer' }
      ]
    }),
    quantityChange: integer({ validation: { isRequired: true } }),
    reason: text(),
    referenceId: text(),
    referenceType: text(),
    event: relationship({ ref: 'LiveShoppingEvent' }),
    createdBy: relationship({ ref: 'User' }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } })
  }
});
```

## GraphQL API (Week 3-4)

Create `/features/keystone/schema.ts` extensions:

```typescript
import { graphql } from '@keystone-6/core';
import { mergeSchemas } from '@graphql-tools/merge';

const liveShoppingTypes = graphql.type({
  name: 'Query',
  fields: {
    liveEvents: graphql.field({
      type: graphql.list(graphql.ref('LiveShoppingEvent')),
      args: {
        status: graphql.arg({ type: graphql.String }),
        limit: graphql.arg({ type: graphql.Int, defaultValue: 20 })
      },
      resolve: async (source, { status, limit }, context) => {
        let query = context.sudo().db.lists.LiveShoppingEvent.findMany({});
        if (status) {
          query = query.where({ status: { equals: status } });
        }
        return query.take(limit);
      }
    }),
    
    inventoryLevels: graphql.field({
      type: graphql.list(graphql.ref('InventoryLevel')),
      args: {
        productId: graphql.arg({ type: graphql.String }),
        warehouseId: graphql.arg({ type: graphql.String })
      },
      resolve: async (source, { productId, warehouseId }, context) => {
        return context.sudo().db.lists.InventoryLevel.findMany({
          where: {
            product: productId ? { id: { equals: productId } } : undefined,
            warehouse: warehouseId ? { id: { equals: warehouseId } } : undefined
          }
        });
      }
    })
  }
});
```

## REST API Endpoints (Week 5)

Create `/app/api/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/keystone-client';
import { authMiddleware, requirePermission } from '@/lib/api-auth';

const client = createClient();

export async function POST(req: NextRequest) {
  try {
    const session = await authMiddleware(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, scheduledStart, scheduledEnd } = await req.json();

    const mutation = `
      mutation CreateEvent($input: LiveShoppingEventCreateInput!) {
        createLiveShoppingEvent(data: $input) {
          id
          title
          status
          host { id }
        }
      }
    `;

    const response = await client.request(mutation, {
      input: {
        title,
        description,
        scheduledStart,
        scheduledEnd,
        host: { connect: { id: session.userId } },
        status: 'draft'
      }
    });

    return NextResponse.json(response.createLiveShoppingEvent);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = `
      query GetEvents($status: String, $limit: Int) {
        liveEvents(status: $status, limit: $limit) {
          id
          title
          status
          viewerCount
          totalSales
          host { id name }
          scheduledStart
        }
      }
    `;

    const response = await client.request(query, { status, limit });
    return NextResponse.json(response.liveEvents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
```

## React Components (Week 6-8)

### LiveEventDashboard Component

Create `/components/live-shopping/live-event-dashboard.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Users, TrendingUp } from 'lucide-react';

interface LiveEvent {
  id: string;
  title: string;
  status: 'draft' | 'scheduled' | 'live' | 'ended';
  viewerCount: number;
  totalSales: number;
  scheduledStart: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function LiveEventDashboard() {
  const { data: events, isLoading } = useSWR<LiveEvent[]>('/api/events', fetcher, {
    refreshInterval: 5000
  });

  const liveEvent = events?.find(e => e.status === 'live');

  return (
    <div className="grid gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Now</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {liveEvent?.viewerCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Viewers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${liveEvent?.totalSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">This event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events?.filter(e => e.status === 'scheduled').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Live Shopping Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {events?.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{event.status}</span>
                    </p>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### Inventory Monitor Component

Create `/components/live-shopping/inventory-monitor.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface InventoryLevel {
  id: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  productName: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function InventoryMonitor({ eventId }: { eventId: string }) {
  const { data: inventory } = useSWR<InventoryLevel[]>(
    `/api/inventory/levels?eventId=${eventId}`,
    fetcher,
    { refreshInterval: 2000 }
  );

  const lowStockItems = inventory?.filter(
    item => item.availableQuantity - item.reservedQuantity < 5
  ) || [];

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} product(s) running low on inventory
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {inventory?.map(item => {
          const available = item.availableQuantity - item.reservedQuantity;
          const statusColor = available > 10 ? 'green' : available > 5 ? 'yellow' : 'red';

          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Available: {available} | Reserved: {item.reservedQuantity}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full bg-${statusColor}-500`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

## WebSocket Integration (Week 9)

Create `/lib/live-event-websocket.ts`:

```typescript
import { WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';

interface WebSocketMessage {
  type: 'stock_update' | 'viewer_count' | 'chat' | 'metrics';
  eventId: string;
  payload: Record<string, unknown>;
}

export class LiveEventBroadcaster {
  private wss: WebSocketServer;
  private eventConnections = new Map<string, Set<WebSocket>>();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/api/live-events' });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const url = new URL(req.url || '', 'ws://localhost');
      const eventId = url.searchParams.get('eventId');

      if (!eventId) {
        ws.close();
        return;
      }

      if (!this.eventConnections.has(eventId)) {
        this.eventConnections.set(eventId, new Set());
      }
      this.eventConnections.get(eventId)!.add(ws);

      ws.on('message', (data) => this.handleMessage(ws, JSON.parse(data.toString())));
      ws.on('close', () => {
        this.eventConnections.get(eventId)?.delete(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    // Process incoming messages from clients if needed
  }

  async broadcastStockUpdate(eventId: string, productId: string, inventory: any) {
    const message: WebSocketMessage = {
      type: 'stock_update',
      eventId,
      payload: { productId, ...inventory }
    };
    this.broadcast(eventId, message);
  }

  async broadcastViewerCount(eventId: string, count: number) {
    const message: WebSocketMessage = {
      type: 'viewer_count',
      eventId,
      payload: { count }
    };
    this.broadcast(eventId, message);
  }

  private broadcast(eventId: string, message: WebSocketMessage) {
    const connections = this.eventConnections.get(eventId);
    if (!connections) return;

    const data = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }
}
```

## Next Steps

1. **Week 1-2**: Run database migrations
2. **Week 3-4**: Implement GraphQL API
3. **Week 5-6**: Build REST endpoints
4. **Week 7-8**: Create React components
5. **Week 9**: Add WebSocket support
6. **Week 10-11**: Integrate with storefront
7. **Week 12**: Performance testing
8. **Week 13-14**: Security hardening
9. **Week 15**: Production deployment
