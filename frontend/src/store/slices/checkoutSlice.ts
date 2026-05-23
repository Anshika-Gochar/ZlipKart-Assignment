import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../../api/orderApi';
import { ApiResponse } from '../../types/api.types';
import { clearCart } from './cartSlice';

// Backend POST /orders returns the full order object + emailSent boolean
type OrderResponse = {
  orderId: string;
  status: string;
  emailSent: boolean;
};

export const placeOrder = createAsyncThunk(
  'checkout/placeOrder',
  async (orderData: Record<string, unknown>, { rejectWithValue, dispatch }) => {
    try {
      const response: ApiResponse<any> = await ordersApi.createOrder(orderData);
      if (response.success && response.data) {
        const orderId = response.data.id as string;
        const status = (response.data.status as string) || 'PENDING';
        const emailSent = (response.data.emailSent as boolean) ?? false;

        // Clear the cart in Redux state since backend clears it on checkout
        dispatch(clearCart());

        return { orderId, status, emailSent };
      }
      return rejectWithValue(response.message || 'Failed to place order');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to place order. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

interface CheckoutState {
  order?: OrderResponse;
  isLoading: boolean;
  error?: string;
}

const initialState: CheckoutState = {
  order: undefined,
  isLoading: false,
  error: undefined,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckout: (state) => {
      state.order = undefined;
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(placeOrder.pending, state => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<OrderResponse>) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
