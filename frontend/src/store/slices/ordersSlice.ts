// Orders slice with async thunks and selectors
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersApi } from '../../api/orderApi';
import { Order } from '../../types/api.types';
import type { RootState } from '../../store';

// GET /orders — backend returns paginated response:
// ApiResponse<{ orders: Order[], total, page, limit }> via ApiResponse.paginated()
export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await ordersApi.listOrders();
    if (response.success) {
      // Backend uses ApiResponse.paginated() which puts data in response.data
      // The actual orders array may be at response.data.orders or response.data directly
      const payload = response.data;
      if (Array.isArray(payload)) return payload as Order[];
      if (payload && Array.isArray(payload.orders)) return payload.orders as Order[];
      return [] as Order[];
    }
    return rejectWithValue(response.message);
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Failed to fetch orders';
    return rejectWithValue(msg);
  }
});

// GET /orders/:id — backend returns full order with items, address
export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await ordersApi.getOrderDetail(orderId);
      if (response.success) return response.data as Order;
      return rejectWithValue(response.message);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to fetch order detail';
      return rejectWithValue(msg);
    }
  }
);

interface OrdersState {
  list: Order[];
  detail: Order | null;
  isLoading: boolean;
  error?: string;
}

const initialState: OrdersState = {
  list: [],
  detail: null,
  isLoading: false,
  error: undefined,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderDetail: (state) => {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderDetail } = ordersSlice.actions;
export const selectOrders = (state: RootState) => state.orders.list;
export const selectOrderDetail = (state: RootState) => state.orders.detail;
export const selectOrdersLoading = (state: RootState) => state.orders.isLoading;
export default ordersSlice.reducer;
