import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { addressApi } from '../../api/addressApi';

type Address = any; // Replace with proper type if available

export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const response = await addressApi.getAddresses();
    if (response.success) return response.data;
    return rejectWithValue(response.message);
  } catch (err) {
    return rejectWithValue('Failed to fetch addresses');
  }
});

export const addAddress = createAsyncThunk('address/addAddress', async (data: Record<string, unknown>, { rejectWithValue }) => {
  try {
    const response = await addressApi.addAddress(data);
    if (response.success) return response.data;
    return rejectWithValue(response.message);
  } catch (err) {
    return rejectWithValue('Failed to add address');
  }
});

export const updateAddress = createAsyncThunk(
  'address/updateAddress',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await addressApi.updateAddress(id, data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue('Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk('address/deleteAddress', async (id: string, { rejectWithValue }) => {
  try {
    const response = await addressApi.deleteAddress(id);
    if (response.success) return id; // return removed id for reducer
    return rejectWithValue(response.message);
  } catch (err) {
    return rejectWithValue('Failed to delete address');
  }
});

interface AddressState {
  addresses: Address[];
  selectedId?: string;
  isLoading: boolean;
  error?: string;
}

const initialState: AddressState = {
  addresses: [],
  selectedId: undefined,
  isLoading: false,
  error: undefined,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
    },
    clearSelection: (state) => {
      state.selectedId = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAddresses.pending, state => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.addresses.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.addresses[idx] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(a => a.id !== action.payload);
        if (state.selectedId === action.payload) state.selectedId = undefined;
      });
  },
});

export const { selectAddress, clearSelection } = addressSlice.actions;
export default addressSlice.reducer;
