// Wishlist slice with async thunks and badge selector
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistApi } from '../../api/wishlistApi';
import { cartApi } from '../../api/cartApi';
import { Product } from '../../types/api.types';
import type { RootState } from '../../store';
import { setCart } from './cartSlice';

// ── fetchWishlist ─────────────────────────────────────────────
// Backend returns: { items: WishlistItem[], totalItems: N }
// Each WishlistItem has: { id, userId, productId, addedAt, product: Product }
// We store only the flat Product[] for easy rendering.
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.getWishlist();
      if (response.success) {
        // Extract nested product from each wishlist item
        const products: Product[] = (response.data?.items ?? [])
          .map((item: { product: Product }) => item.product)
          .filter(Boolean);
        return products;
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue('Failed to fetch wishlist');
    }
  }
);

// ── addToWishlist ─────────────────────────────────────────────
// POST /wishlist/:productId
// Backend returns updated wishlist — we re-fetch for simplicity
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.addItem(productId);
      if (response.success) {
        // Backend returns the updated wishlist — extract products
        const products: Product[] = (response.data?.items ?? [])
          .map((item: { product: Product }) => item.product)
          .filter(Boolean);
        return products;
      }
      return rejectWithValue(response.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add to wishlist';
      return rejectWithValue(msg);
    }
  }
);

// ── removeFromWishlist ────────────────────────────────────────
// DELETE /wishlist/:productId
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.removeItem(productId);
      if (response.success) return productId;
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue('Failed to remove from wishlist');
    }
  }
);

// ── moveToCart ────────────────────────────────────────────────
// No dedicated backend endpoint — we do it in two steps:
//   1. Add product to cart via cartApi.addItem
//   2. Remove product from wishlist via wishlistApi.removeItem
// Both operations use the real backend routes.
export const moveToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async (productId: string, { rejectWithValue, dispatch }) => {
    try {
      // Step 1: add to cart
      const cartResponse = await cartApi.addItem({ productId, quantity: 1 });
      if (cartResponse.success) {
        // Update cart state immediately
        dispatch(setCart(cartResponse.data));
      }

      // Step 2: remove from wishlist
      const wishlistResponse = await wishlistApi.removeItem(productId);
      if (wishlistResponse.success) return productId;
      return rejectWithValue(wishlistResponse.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to move item to cart';
      return rejectWithValue(msg);
    }
  }
);

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error?: string;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: undefined,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // removeFromWishlist — optimistic: filter out by productId
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      // moveToCart — remove from local wishlist state
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.items.some((item) => item.id === productId);
export default wishlistSlice.reducer;
