/**
 * Compute delivery fee based on cart subtotal.
 * Free delivery for orders >= 500 INR, otherwise flat 40 INR.
 */
export const calculateDeliveryFee = (subtotal: number): number => {
  const FREE_THRESHOLD = 500; // ₹500
  const FLAT_FEE = 40; // ₹40
  return subtotal >= FREE_THRESHOLD ? 0 : FLAT_FEE;
};
