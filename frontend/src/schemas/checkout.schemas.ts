import { z } from 'zod';

// Field names match the backend Prisma Address model exactly:
// fullName, phone, street, city, state, pincode, landmark, isDefault
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number starting with 6-9'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  landmark: z.string().optional(),
  country: z.string().optional(),
});

export type AddressData = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  addressId: z.string().min(1, 'Please select a delivery address'),
  // Backend enum: COD | UPI | CARD | NET_BANKING | WALLET
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NET_BANKING', 'WALLET']),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;
