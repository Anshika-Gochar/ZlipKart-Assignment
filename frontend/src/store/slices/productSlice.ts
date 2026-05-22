import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../api/productApi';
import { Product, PaginationMeta } from '../../types/api.types';
import { ProductListQuery, SearchQuery } from '../../types/product.types';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  meta: PaginationMeta | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  currentProductStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  meta: null,
  status: 'idle',
  currentProductStatus: 'idle',
  error: null,
};

export const fetchProductsAsync = createAsyncThunk(
  'products/fetchProducts',
  async (query: ProductListQuery, { rejectWithValue }) => {
    try {
      const response = await productApi.getAll(query);
      return response;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as any;
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
      }
      return rejectWithValue('Failed to fetch products');
    }
  }
);

export const searchProductsAsync = createAsyncThunk(
  'products/searchProducts',
  async (query: SearchQuery, { rejectWithValue }) => {
    try {
      const response = await productApi.search(query);
      return response;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as any;
        return rejectWithValue(error.response?.data?.message || 'Failed to search products');
      }
      return rejectWithValue('Failed to search products');
    }
  }
);

export const fetchProductByIdAsync = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productApi.getById(id);
      return response.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as any;
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
      }
      return rejectWithValue('Failed to fetch product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductStatus = 'idle';
    }
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder.addCase(fetchProductsAsync.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.products = action.payload.data;
      state.meta = action.payload.meta || null;
    });
    builder.addCase(fetchProductsAsync.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Search Products
    builder.addCase(searchProductsAsync.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(searchProductsAsync.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.products = action.payload.data;
      state.meta = action.payload.meta || null;
    });
    builder.addCase(searchProductsAsync.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Fetch Product By ID
    builder.addCase(fetchProductByIdAsync.pending, (state) => {
      state.currentProductStatus = 'loading';
      state.error = null;
    });
    builder.addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
      state.currentProductStatus = 'succeeded';
      state.currentProduct = action.payload;
    });
    builder.addCase(fetchProductByIdAsync.rejected, (state, action) => {
      state.currentProductStatus = 'failed';
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
