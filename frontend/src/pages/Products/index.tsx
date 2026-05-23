import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchProductsAsync } from '../../store/slices/productSlice';
import { fetchCategoriesAsync } from '../../store/slices/categorySlice';
import { FiltersSidebar } from '../../components/shared/FiltersSidebar';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { PackageOpen, ChevronRight, Search } from 'lucide-react';
import type { ProductListQuery, SortBy } from '../../types/product.types';

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, status, meta } = useSelector((state: RootState) => state.products);
  const { categories, status: catStatus } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    if (catStatus === 'idle') {
      dispatch(fetchCategoriesAsync());
    }
  }, [catStatus, dispatch]);

  // Read ALL filter params from URL and dispatch to Redux
  useEffect(() => {
    const query: ProductListQuery = {};

    if (searchParams.has('page'))        query.page        = Number(searchParams.get('page'));
    if (searchParams.has('categoryId'))  query.categoryId  = searchParams.get('categoryId')!;
    if (searchParams.has('minPrice'))    query.minPrice    = Number(searchParams.get('minPrice'));
    if (searchParams.has('maxPrice'))    query.maxPrice    = Number(searchParams.get('maxPrice'));
    if (searchParams.has('sortBy'))      query.sortBy      = searchParams.get('sortBy') as SortBy;
    if (searchParams.has('brand'))       query.brand       = searchParams.get('brand')!;
    if (searchParams.has('minRating'))   query.minRating   = Number(searchParams.get('minRating'));
    if (searchParams.has('inStock'))     query.inStock     = searchParams.get('inStock') === 'true';
    if (searchParams.has('minDiscount')) query.minDiscount = Number(searchParams.get('minDiscount'));
    if (searchParams.has('search'))      query.search      = searchParams.get('search')!;

    dispatch(fetchProductsAsync(query));
  }, [searchParams, dispatch]);

  const handleSortChange = (sortBy: string) => {
    searchParams.set('sortBy', sortBy);
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const handlePageChange = (page: number) => {
    searchParams.set('page', page.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const currentSort   = searchParams.get('sortBy') || 'newest';
  const searchQuery   = searchParams.get('search') || '';
  const activeCategory = categories.find(c => c.id === searchParams.get('categoryId'));

  // Human-readable page title
  const pageTitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : activeCategory
      ? activeCategory.name
      : 'All Products';

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* Sidebar Filters */}
        <aside className="w-full lg:w-[260px] flex-shrink-0 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.1)] rounded-sm">
          <FiltersSidebar
            categories={categories}
            isCategoriesLoading={catStatus === 'loading'}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.1)] rounded-sm min-h-[600px] flex flex-col">

          {/* Top Bar: Breadcrumbs & Sorting */}
          <div className="px-4 py-3 border-b border-gray-100 flex flex-col space-y-2">
            {/* Breadcrumb */}
            <div className="flex items-center text-[12px] text-[#878787]">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <ChevronRight className="w-3 h-3 mx-1" />
              {activeCategory && (
                <>
                  <span className="hover:text-primary-600 cursor-pointer">{activeCategory.name}</span>
                  <ChevronRight className="w-3 h-3 mx-1" />
                </>
              )}
              <span className="text-[#878787]">Products</span>
            </div>

            {/* Title + Result count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                {searchQuery ? (
                  <h1 className="text-[15px] font-medium text-[#212121] flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#878787]" />
                    {pageTitle}
                    {meta && (
                      <span className="text-[#878787] text-[12px] font-normal ml-1">
                        ({meta.total} results)
                      </span>
                    )}
                  </h1>
                ) : (
                  <h1 className="text-[15px] font-medium text-[#212121]">
                    {pageTitle}
                    {meta && (
                      <span className="text-[#878787] text-[12px] font-normal ml-1">
                        (Showing {meta.page === 1 ? 1 : (meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total})
                      </span>
                    )}
                  </h1>
                )}
              </div>

              {/* Sort Tabs */}
              <div className="flex items-center space-x-5 mt-2 sm:mt-0 overflow-x-auto w-full sm:w-auto hide-scrollbar">
                <span className="text-[13px] font-medium text-[#212121] whitespace-nowrap flex-shrink-0">Sort By</span>
                {[
                  { label: 'Relevance',       value: 'newest'     },
                  { label: 'Price: Low–High', value: 'price_asc'  },
                  { label: 'Price: High–Low', value: 'price_desc' },
                  { label: 'Rating',          value: 'rating'     },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleSortChange(value)}
                    className={`text-[13px] whitespace-nowrap flex-shrink-0 pb-0.5 ${
                      currentSort === value
                        ? 'text-primary-600 font-medium border-b-2 border-primary-600'
                        : 'text-[#878787] hover:text-primary-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {status === 'loading' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-0 border-b border-gray-100">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-r border-b border-gray-100 last:border-r-0">
                    <ProductSkeleton />
                  </div>
                ))}
              </div>
            ) : status === 'succeeded' && products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-0">
                  {products.map((product) => (
                    <div key={product.id} className="border-r border-b border-gray-100 hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:z-10 relative bg-white">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {meta && (
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <div className="py-20">
                <EmptyState
                  title="Sorry, no results found!"
                  description={
                    searchQuery
                      ? `No products found for "${searchQuery}". Try different keywords or clear the filters.`
                      : "Please check the spelling or try searching for something else"
                  }
                  icon={<PackageOpen size={48} strokeWidth={1} className="text-gray-300" />}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
