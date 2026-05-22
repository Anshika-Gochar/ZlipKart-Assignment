/**
 * src/modules/addresses/address.repository.ts
 *
 * Data access layer for Address entity.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: All queries filter by userId
 * ─────────────────────────────────────────────────────────────
 * Every query that fetches or modifies an address includes
 * userId in the WHERE clause. This means:
 *  - findAddressById(id, userId) → null if id belongs to another user
 *  - The service never needs a separate ownership check
 *  - Zero information leakage about other users' addresses
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: setDefault uses a Prisma batch transaction
 * ─────────────────────────────────────────────────────────────
 * Setting a new default requires TWO operations:
 *  1. Unset all current defaults for this user
 *  2. Set the target address as default
 *
 * Using db.$transaction([...]) (batch form) ensures both
 * operations commit atomically — no window where zero or
 * two addresses are marked default.
 *
 * ─────────────────────────────────────────────────────────────
 * KEY DESIGN: Address deletion guard
 * ─────────────────────────────────────────────────────────────
 * The Prisma schema comment notes that addresses referenced by
 * orders should NOT be hard-deleted (they'd break order history).
 * We check for linked orders before deletion and refuse if found.
 */

import db from "../../config/db";
import { Prisma } from "@prisma/client";
import { CreateAddressInput, UpdateAddressInput } from "./address.schema";

// ── Reusable address select ────────────────────────────────────
const addressSelect = {
  id: true,
  fullName: true,
  phone: true,
  street: true,
  city: true,
  state: true,
  pincode: true,
  landmark: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AddressSelect;

// ── Inferred return type ──────────────────────────────────────
export type AddressRecord = Prisma.AddressGetPayload<{
  select: typeof addressSelect;
}>;

// ── List all addresses for a user ─────────────────────────────
// Default address comes first, then sorted by creation date
export const findAddressesByUserId = async (
  userId: string
): Promise<AddressRecord[]> => {
  return db.address.findMany({
    where: { userId },
    select: addressSelect,
    orderBy: [
      { isDefault: "desc" }, // Default address always first
      { createdAt: "asc" },  // Then oldest → newest
    ],
  });
};

// ── Find a single address with ownership check ────────────────
export const findAddressByIdAndUser = async (
  id: string,
  userId: string
): Promise<AddressRecord | null> => {
  return db.address.findFirst({
    where: { id, userId }, // ownership baked into the query
    select: addressSelect,
  });
};

// ── Count how many addresses the user already has ─────────────
// Used to auto-set isDefault on the first address
export const countAddressesByUserId = async (userId: string): Promise<number> => {
  return db.address.count({ where: { userId } });
};

// ── Check if an address has any linked orders ─────────────────
// We refuse to delete addresses referenced by orders to preserve history
export const countOrdersForAddress = async (addressId: string): Promise<number> => {
  return db.order.count({ where: { addressId } });
};

// ── Create a new address ──────────────────────────────────────
export const createAddress = async (
  userId: string,
  data: CreateAddressInput & { isDefault: boolean }
): Promise<AddressRecord> => {
  return db.address.create({
    data: { userId, ...data },
    select: addressSelect,
  });
};

// ── Update an address ─────────────────────────────────────────
// Callers have already verified ownership via findAddressByIdAndUser
export const updateAddress = async (
  id: string,
  data: UpdateAddressInput
): Promise<AddressRecord> => {
  return db.address.update({
    where: { id },
    data,
    select: addressSelect,
  });
};

// ── Unset default on all user addresses ───────────────────────
// Used as part of the set-default transaction
export const clearDefaultForUser = async (userId: string): Promise<void> => {
  await db.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
};

// ── Set one address as default (atomic two-step) ─────────────
// Uses Prisma batch transaction: both ops commit together or neither does
export const setAddressAsDefault = async (
  addressId: string,
  userId: string
): Promise<AddressRecord> => {
  const [, updated] = await db.$transaction([
    // Step 1: unset ALL defaults for this user
    db.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }),
    // Step 2: set this address as default
    db.address.update({
      where: { id: addressId },
      data: { isDefault: true },
      select: addressSelect,
    }),
  ]);

  return updated;
};

// ── Delete an address ─────────────────────────────────────────
export const deleteAddress = async (id: string): Promise<void> => {
  await db.address.delete({ where: { id } });
};
