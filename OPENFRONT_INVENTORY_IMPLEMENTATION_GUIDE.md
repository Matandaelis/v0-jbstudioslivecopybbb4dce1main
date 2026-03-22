# Openfront Inventory Management - Implementation Guide

## Quick Start Implementation

This guide provides step-by-step instructions for implementing the inventory management module in Openfront.

---

## Section 1: Database Setup

### 1.1 Running Migrations

```bash
# Clone the repository
git clone https://github.com/openshiporg/openfront.git
cd openfront

# Install dependencies
npm install

# Create migration files
npm run migrate:gen

# Apply migrations
npm run migrate
```

### 1.2 Creating Keystone Models

Create file: `features/keystone/models/inventory.ts`

```typescript
import { list } from '@keystone-6/core';
import {
  text,
  integer,
  decimal,
  timestamp,
  enum as enumField,
  relationship,
  checkbox,
  virtual,
} from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';

export const inventoryModels = {
  InventoryLevel: list({
    access: allowAll,
    fields: {
      variant: relationship({
        ref: 'ProductVariant.inventoryLevels',
      }),
      warehouse: relationship({
        ref: 'Warehouse.inventoryLevels',
      }),
      quantityOnHand: integer({
        defaultValue: 0,
        validation: { isRequired: true },
      }),
      quantityReserved: integer({
        defaultValue: 0,
        isIndexed: 'unique',
      }),
      quantityOnOrder: integer({ defaultValue: 0 }),
      quantityDefective: integer({ defaultValue: 0 }),
      availableQuantity: virtual({
        field: async (item) => {
          return (
            item.quantityOnHand -
            item.quantityReserved -
            item.quantityDefective
          );
        },
      }),
      lastCountedAt: timestamp(),
      reorderPoint: integer(),
      reorderQuantity: integer(),
      leadTimeDays: integer({ defaultValue: 7 }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
      updatedAt: timestamp({
        db: { updatedAt: true },
      }),
    },
  }),

  InventoryMovement: list({
    access: allowAll,
    fields: {
      inventoryLevel: relationship({
        ref: 'InventoryLevel.movements',
      }),
      movementType: enumField({
        options: [
          { label: 'Purchase Order', value: 'PURCHASE_ORDER' },
          { label: 'Sales Order', value: 'SALES_ORDER' },
          { label: 'Return', value: 'RETURN' },
          { label: 'Adjustment', value: 'ADJUSTMENT' },
          { label: 'Cycle Count', value: 'CYCLE_COUNT' },
          { label: 'Transfer', value: 'TRANSFER' },
          { label: 'Damage', value: 'DAMAGE' },
          { label: 'Shrinkage', value: 'SHRINKAGE' },
          { label: 'Promotion', value: 'PROMOTION' },
        ],
        type: 'enum',
      }),
      quantityBefore: integer({ validation: { isRequired: true } }),
      quantityChange: integer({ validation: { isRequired: true } }),
      quantityAfter: integer({ validation: { isRequired: true } }),
      referenceId: text(),
      notes: text({ db: { isNullable: true } }),
      performedBy: relationship({ ref: 'User.inventoryMovements' }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),

  StockAlert: list({
    access: allowAll,
    fields: {
      inventoryLevel: relationship({
        ref: 'InventoryLevel.alerts',
      }),
      alertType: enumField({
        options: [
          { label: 'Low Stock', value: 'LOW_STOCK' },
          { label: 'Overstocked', value: 'OVERSTOCKED' },
          { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
          { label: 'Excess Defective', value: 'EXCESS_DEFECTIVE' },
        ],
        type: 'enum',
      }),
      thresholdValue: integer({ validation: { isRequired: true } }),
      isActive: checkbox({ defaultValue: true }),
      notifiedAt: timestamp({ db: { isNullable: true } }),
      dismissedAt: timestamp({ db: { isNullable: true } }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),

  CycleCount: list({
    access: allowAll,
    fields: {
      warehouse: relationship({ ref: 'Warehouse.cycleCounts' }),
      countType: enumField({
        options: [
          { label: 'Full', value: 'FULL' },
          { label: 'Partial', value: 'PARTIAL' },
          { label: 'ABC Analysis', value: 'ABC_ANALYSIS' },
        ],
        type: 'enum',
      }),
      status: enumField({
        options: [
          { label: 'Planned', value: 'PLANNED' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Approved', value: 'APPROVED' },
        ],
        type: 'enum',
        defaultValue: 'PLANNED',
      }),
      scheduledDate: timestamp({ validation: { isRequired: true } }),
      startedAt: timestamp({ db: { isNullable: true } }),
      completedAt: timestamp({ db: { isNullable: true } }),
      approverId: relationship({ ref: 'User.approvedCycleCounts' }),
      approvedAt: timestamp({ db: { isNullable: true } }),
      varianceTolerance: decimal({
        defaultValue: '2.00',
        precision: 5,
        scale: 2,
      }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),
};
```

---

## Section 2: GraphQL API Implementation

### 2.1 Inventory Resolvers

Create file: `features/keystone/resolvers/inventory.resolvers.ts`

```typescript
import { graphql } from '@keystone-6/core';

export const inventoryResolvers = {
  Query: {
    inventoryLevel: async (
      _parent,
      { variantId, warehouseId },
      context
    ) => {
      return context.sudo().prisma.inventoryLevel.findUnique({
        where: {
          variant_warehouse: {
            variantId,
            warehouseId,
          },
        },
        include: {
          variant: true,
          warehouse: true,
          alerts: true,
          movements: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });
    },

    inventoryLevels: async (
      _parent,
      { warehouseId, variantId, onlyLowStock, first = 20, after },
      context
    ) => {
      const where = {};
      if (warehouseId) where.warehouseId = warehouseId;
      if (variantId) where.variantId = variantId;
      if (onlyLowStock) {
        where.quantityOnHand = {
          lte: graphql.prisma.fields.reorderPoint,
        };
      }

      const items = await context.sudo().prisma.inventoryLevel.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        orderBy: { updatedAt: 'desc' },
        include: {
          variant: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true } },
        },
      });

      return {
        edges: items.map((item) => ({
          node: item,
          cursor: Buffer.from(item.id).toString('base64'),
        })),
        pageInfo: {
          hasNextPage: items.length === first,
          endCursor:
            items.length > 0
              ? Buffer.from(items[items.length - 1].id).toString('base64')
              : null,
        },
      };
    },

    stockMovements: async (
      _parent,
      { inventoryLevelId, startDate, endDate, first = 50 },
      context
    ) => {
      return context.sudo().prisma.inventoryMovement.findMany({
        where: {
          inventoryLevelId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        take: first,
        orderBy: { createdAt: 'desc' },
        include: {
          inventoryLevel: true,
          performedBy: { select: { id: true, name: true } },
        },
      });
    },

    stockAlerts: async (
      _parent,
      { warehouseId, isActive, alertType },
      context
    ) => {
      return context.sudo().prisma.stockAlert.findMany({
        where: {
          isActive: isActive !== undefined ? isActive : true,
          alertType,
          inventoryLevel: {
            warehouseId,
          },
        },
        include: {
          inventoryLevel: {
            include: { variant: true, warehouse: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    adjustInventory: async (
      _parent,
      {
        variantId,
        warehouseId,
        quantityChange,
        movementType,
        referenceId,
        notes,
      },
      context
    ) => {
      const session = context.session;

      // Validate permissions
      if (!session?.user?.id) {
        throw new Error('Unauthorized');
      }

      const prisma = context.sudo().prisma;

      // Get current inventory level
      const inventoryLevel = await prisma.inventoryLevel.findUnique({
        where: {
          variant_warehouse: { variantId, warehouseId },
        },
      });

      if (!inventoryLevel) {
        throw new Error('Inventory level not found');
      }

      const newQuantity = inventoryLevel.quantityOnHand + quantityChange;

      if (newQuantity < 0) {
        throw new Error('Insufficient inventory for this adjustment');
      }

      // Update inventory level
      const updated = await prisma.inventoryLevel.update({
        where: { id: inventoryLevel.id },
        data: {
          quantityOnHand: newQuantity,
        },
      });

      // Record movement
      await prisma.inventoryMovement.create({
        data: {
          inventoryLevelId: inventoryLevel.id,
          movementType,
          quantityBefore: inventoryLevel.quantityOnHand,
          quantityChange,
          quantityAfter: newQuantity,
          referenceId,
          notes,
          performedById: session.user.id,
        },
      });

      // Check for alerts
      await checkAndTriggerAlerts(
        inventoryLevel.id,
        newQuantity,
        prisma
      );

      return {
        success: true,
        newQuantity,
        movement: {
          quantityBefore: inventoryLevel.quantityOnHand,
          quantityChange,
          quantityAfter: newQuantity,
        },
      };
    },

    createStockAlert: async (
      _parent,
      { inventoryLevelId, alertType, thresholdValue },
      context
    ) => {
      return context.sudo().prisma.stockAlert.create({
        data: {
          inventoryLevelId,
          alertType,
          thresholdValue,
          isActive: true,
        },
        include: { inventoryLevel: true },
      });
    },

    setReorderPoint: async (
      _parent,
      { variantId, warehouseId, minStock, maxStock, reorderQty, leadTime },
      context
    ) => {
      const prisma = context.sudo().prisma;

      const inventoryLevel = await prisma.inventoryLevel.findUnique({
        where: {
          variant_warehouse: { variantId, warehouseId },
        },
      });

      if (!inventoryLevel) {
        throw new Error('Inventory level not found');
      }

      return prisma.inventoryLevel.update({
        where: { id: inventoryLevel.id },
        data: {
          reorderPoint: minStock,
          reorderQuantity: reorderQty,
          leadTimeDays: leadTime,
        },
      });
    },

    startCycleCount: async (
      _parent,
      { warehouseId, countType, scheduledDate },
      context
    ) => {
      const session = context.session;

      return context.sudo().prisma.cycleCount.create({
        data: {
          warehouseId,
          countType,
          scheduledDate,
          status: 'PLANNED',
        },
      });
    },
  },
};

async function checkAndTriggerAlerts(
  inventoryLevelId,
  newQuantity,
  prisma
) {
  const alerts = await prisma.stockAlert.findMany({
    where: {
      inventoryLevelId,
      isActive: true,
    },
  });

  for (const alert of alerts) {
    let shouldTrigger = false;

    switch (alert.alertType) {
      case 'LOW_STOCK':
        shouldTrigger = newQuantity <= alert.thresholdValue;
        break;
      case 'OUT_OF_STOCK':
        shouldTrigger = newQuantity === 0;
        break;
      case 'OVERSTOCKED':
        shouldTrigger = newQuantity >= alert.thresholdValue;
        break;
    }

    if (shouldTrigger && !alert.notifiedAt) {
      await prisma.stockAlert.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });

      // Send notification (email, Slack, etc.)
      await sendStockAlertNotification(alert, newQuantity);
    }
  }
}
```

---

## Section 3: REST API Endpoints

Create file: `app/api/inventory/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'levels':
      return getInventoryLevels(request, session);
    case 'movements':
      return getStockMovements(request, session);
    case 'alerts':
      return getStockAlerts(request, session);
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'adjust':
      return adjustInventory(body, session);
    case 'alert':
      return createStockAlert(body, session);
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

async function getInventoryLevels(
  request: NextRequest,
  session: any
) {
  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get('warehouse');
  const variantId = searchParams.get('variant');

  // Query database
  const levels = await prisma.inventoryLevel.findMany({
    where: {
      ...(warehouseId && { warehouseId }),
      ...(variantId && { variantId }),
    },
    include: {
      variant: true,
      warehouse: true,
    },
    take: 50,
  });

  return NextResponse.json(levels);
}

async function adjustInventory(body: any, session: any) {
  const {
    variantId,
    warehouseId,
    quantityChange,
    movementType,
    referenceId,
    notes,
  } = body;

  try {
    const result = await prisma.inventoryLevel.update({
      where: {
        variant_warehouse: { variantId, warehouseId },
      },
      data: {
        quantityOnHand: {
          increment: quantityChange,
        },
      },
    });

    // Record movement
    await prisma.inventoryMovement.create({
      data: {
        inventoryLevelId: result.id,
        movementType,
        quantityBefore: result.quantityOnHand,
        quantityChange,
        quantityAfter: result.quantityOnHand + quantityChange,
        referenceId,
        notes,
        performedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      newQuantity: result.quantityOnHand + quantityChange,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

## Section 4: Frontend Components

### 4.1 Inventory Dashboard

Create file: `components/inventory/InventoryDashboard.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function InventoryDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryStats();
  }, []);

  const fetchInventoryStats = async () => {
    try {
      const response = await fetch(
        '/api/inventory?action=health'
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total SKUs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalSkus}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Low Stock Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">
            {stats?.lowStockCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Out of Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {stats?.outOfStockCount}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats?.totalValue?.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4.2 Adjustment Form

Create file: `components/inventory/InventoryAdjustmentForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function InventoryAdjustmentForm() {
  const [formData, setFormData] = useState({
    variantId: '',
    warehouseId: '',
    quantityChange: 0,
    movementType: 'ADJUSTMENT',
    referenceId: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust',
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to adjust inventory');
      }

      // Reset form
      setFormData({
        variantId: '',
        warehouseId: '',
        quantityChange: 0,
        movementType: 'ADJUSTMENT',
        referenceId: '',
        notes: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Product</label>
        <Input
          type="text"
          placeholder="Select product..."
          value={formData.variantId}
          onChange={(e) =>
            setFormData({
              ...formData,
              variantId: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="text-sm font-medium">Warehouse</label>
        <Select
          value={formData.warehouseId}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              warehouseId: value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wh1">Warehouse 1</SelectItem>
            <SelectItem value="wh2">Warehouse 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">
          Quantity Change
        </label>
        <Input
          type="number"
          placeholder="0"
          value={formData.quantityChange}
          onChange={(e) =>
            setFormData({
              ...formData,
              quantityChange: parseInt(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Adjustment notes..."
          value={formData.notes}
          onChange={(e) =>
            setFormData({
              ...formData,
              notes: e.target.value,
            })
          }
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? 'Adjusting...' : 'Adjust Inventory'}
      </Button>
    </form>
  );
}
```

---

## Section 5: Testing

Create file: `__tests__/inventory.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { adjustInventory } from '@/lib/inventory/services';
import { prisma } from '@/lib/prisma';

describe('Inventory Management', () => {
  beforeEach(async () => {
    // Clear test data
    await prisma.inventoryLevel.deleteMany();
  });

  it('should adjust inventory correctly', async () => {
    const result = await adjustInventory({
      variantId: 'test-variant',
      warehouseId: 'test-warehouse',
      quantityChange: 10,
      movementType: 'ADJUSTMENT',
      referenceId: 'test-ref',
      notes: 'Test adjustment',
    });

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(10);
  });

  it('should prevent negative inventory', async () => {
    expect(() =>
      adjustInventory({
        variantId: 'test-variant',
        warehouseId: 'test-warehouse',
        quantityChange: -100,
        movementType: 'ADJUSTMENT',
      })
    ).rejects.toThrow('Insufficient inventory');
  });

  it('should record inventory movements', async () => {
    await adjustInventory({
      variantId: 'test-variant',
      warehouseId: 'test-warehouse',
      quantityChange: 5,
      movementType: 'PURCHASE_ORDER',
    });

    const movements = await prisma.inventoryMovement.findMany({
      where: {
        movementType: 'PURCHASE_ORDER',
      },
    });

    expect(movements.length).toBe(1);
    expect(movements[0].quantityChange).toBe(5);
  });
});
```

---

## Section 6: Deployment Checklist

- [ ] Database migrations applied
- [ ] Keystone models registered
- [ ] GraphQL resolvers deployed
- [ ] REST API endpoints tested
- [ ] Frontend components verified
- [ ] Tests passing (100% coverage)
- [ ] Environment variables configured
- [ ] Webhooks registered
- [ ] Monitoring alerts enabled
- [ ] Documentation updated
- [ ] Team trained
- [ ] Staged rollout plan activated

---

## Support & Resources

- Openfront Docs: https://docs.openship.org
- Keystone Docs: https://keystonejs.com
- GitHub Repository: https://github.com/openshiporg/openfront
- Issue Tracker: https://github.com/openshiporg/openfront/issues
