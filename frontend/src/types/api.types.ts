// src/types/api.types.ts

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;       // total matching products (backend field name)
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  price: number;
  discountPrice: number;
  stock: number;
  isActive: boolean;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface CartSummary {
  totalProducts: number;
  totalItems: number;
  subtotal: number;
  totalSavings: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  summary: CartSummary;
  updatedAt?: string;
}

// ── Order types — aligned with backend response shape ──────────
// Backend OrderItem: { id, quantity, priceAtPurchase, productId, product: { id, name, slug, brand, imageUrls } }
export interface OrderItemProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  imageUrls: string[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;   // Backend stores as Prisma.Decimal, serialized as number
  productId: string;
  product?: OrderItemProduct;
}

// Backend Order address snapshot: { fullName, phone, street, city, state, pincode, landmark }
export interface OrderAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

// Backend Order: { id, status, paymentStatus, paymentMethod, totalAmount, notes, createdAt, updatedAt, address, items }
export interface Order {
  id: string;
  createdAt: string;
  updatedAt?: string;
  totalAmount: number;
  status: string;          // PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  paymentStatus?: string;  // UNPAID | PAID | REFUNDED
  paymentMethod?: string;  // COD | UPI | CARD | NET_BANKING | WALLET
  notes?: string;
  address?: OrderAddress;
  items: OrderItem[];
}
