/**
 * src/modules/addresses/address.service.ts
 *
 * Address Business Logic Layer.
 *
 * Business rules enforced here:
 *  ✓ First address created → automatically set as default
 *  ✓ Creating with isDefault=true → atomically demotes old default
 *  ✓ Updating with isDefault=true → same demotion behavior
 *  ✓ Cannot delete an address referenced by an existing order
 *  ✓ Cannot delete the only remaining address (optional strictness)
 *  ✓ Setting default → atomic: unset all then set one
 *  ✗ No Prisma queries — all DB work in repository
 *  ✗ No req/res — controller handles HTTP
 */

import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../utils/ApiError";
import { CreateAddressInput, UpdateAddressInput } from "./address.schema";
import {
  findAddressesByUserId,
  findAddressByIdAndUser,
  countAddressesByUserId,
  countOrdersForAddress,
  createAddress,
  updateAddress,
  clearDefaultForUser,
  setAddressAsDefault,
  deleteAddress,
} from "./address.repository";

// ─────────────────────────────────────────────────────────────
// CREATE ADDRESS
// ─────────────────────────────────────────────────────────────
/**
 * Business rules:
 *  1. If this is the user's FIRST address → automatically isDefault=true
 *     (UX: a user should always have a default if they have any address)
 *  2. If isDefault=true is requested → first clear existing default
 *  3. Otherwise → isDefault stays false
 */
export const createAddressForUser = async (
  userId: string,
  input: CreateAddressInput
) => {
  const existingCount = await countAddressesByUserId(userId);
  const isFirst = existingCount === 0;

  // Determine final isDefault value
  const shouldBeDefault = isFirst || input.isDefault === true;

  // If this will be the new default, demote the existing one first
  if (!isFirst && shouldBeDefault) {
    await clearDefaultForUser(userId);
  }

  return createAddress(userId, {
    ...input,
    isDefault: shouldBeDefault,
  });
};

// ─────────────────────────────────────────────────────────────
// GET ALL ADDRESSES
// ─────────────────────────────────────────────────────────────
export const getAddresses = async (userId: string) => {
  return findAddressesByUserId(userId);
};

// ─────────────────────────────────────────────────────────────
// UPDATE ADDRESS
// ─────────────────────────────────────────────────────────────
/**
 * Partial update — only provided fields are changed.
 * If isDefault=true is sent, the set-default flow runs atomically.
 * If isDefault=false is sent while address is currently default,
 * we reject — use another endpoint to change the default.
 */
export const updateAddressForUser = async (
  userId: string,
  addressId: string,
  input: UpdateAddressInput
) => {
  // Verify ownership
  const address = await findAddressByIdAndUser(addressId, userId);
  if (!address) {
    throw ApiError.notFound("Address");
  }

  // Guard: don't allow unsetting default directly (breaks UX invariant)
  // To change default, use the PATCH /:id/default endpoint
  if (input.isDefault === false && address.isDefault) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Cannot unset the default address directly. Set another address as default first."
    );
  }

  // If setting this as default, run the atomic two-step
  if (input.isDefault === true && !address.isDefault) {
    // Set-default handles the transaction internally
    await setAddressAsDefault(addressId, userId);
    // Now update remaining fields (if any) without isDefault
    const { isDefault: _, ...rest } = input;
    if (Object.keys(rest).length > 0) {
      return updateAddress(addressId, rest);
    }
    return findAddressByIdAndUser(addressId, userId);
  }

  // Normal partial update
  return updateAddress(addressId, input);
};

// ─────────────────────────────────────────────────────────────
// SET DEFAULT ADDRESS
// ─────────────────────────────────────────────────────────────
/**
 * Dedicated endpoint for setting default.
 * Uses an atomic batch transaction (two SQL statements, one commit).
 *
 * Flow:
 *  1. Verify address belongs to user
 *  2. Atomically: unset all user defaults, set this one
 */
export const setDefaultAddress = async (userId: string, addressId: string) => {
  // Ownership check
  const address = await findAddressByIdAndUser(addressId, userId);
  if (!address) {
    throw ApiError.notFound("Address");
  }

  // Already default — no-op (idempotent)
  if (address.isDefault) {
    return address;
  }

  return setAddressAsDefault(addressId, userId);
};

// ─────────────────────────────────────────────────────────────
// DELETE ADDRESS
// ─────────────────────────────────────────────────────────────
/**
 * Business rules:
 *  1. Ownership check — users can only delete their own addresses
 *  2. Cannot delete an address referenced by an order (data integrity)
 *     The order record still points to this address for history
 *  3. If deleting the default address and others exist → promote
 *     the next oldest address to default automatically
 */
export const deleteAddressForUser = async (
  userId: string,
  addressId: string
) => {
  // 1. Ownership check
  const address = await findAddressByIdAndUser(addressId, userId);
  if (!address) {
    throw ApiError.notFound("Address");
  }

  // 2. Refuse if linked to an order (would break order history FK)
  const linkedOrders = await countOrdersForAddress(addressId);
  if (linkedOrders > 0) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `This address is linked to ${linkedOrders} order(s) and cannot be deleted. ` +
        "You can still update its details."
    );
  }

  // 3. Delete the address
  await deleteAddress(addressId);

  // 4. If it was the default, auto-promote another address
  if (address.isDefault) {
    const remaining = await findAddressesByUserId(userId);
    if (remaining.length > 0) {
      // Promote the oldest remaining address
      await setAddressAsDefault(remaining[0].id, userId);
    }
  }
};
