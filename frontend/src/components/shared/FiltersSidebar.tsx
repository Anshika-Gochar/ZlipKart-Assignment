import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category } from '../../types/api.types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FiltersSidebarProps {
  categories: Category[];
  isCategoriesLoading: boolean;
}

// ── Known brands in the curated dataset ───────────────────────
// These are extracted from the actual seed data.
// In a production app, this would be fetched from /api/brands.
const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'Sony', 'boAt', 'Garmin',
  'Nike', 'Puma', 'Clarks', 'Allen Solly', "Levi's", 'Zara', 'H&M', 'Biba',
  'Dell', 'ASUS', 'Google',
  'Minimalist', 'L\'Oreal', 'M.A.C', 'Plum', 'Philips', 'Dyson',
  'Yonex', 'Nivia', 'Boldfit', 'Decathlon', 'Optimum Nutrition',
  'Pigeon', 'Wakefit', 'Milton', 'Tata',
  'Funskool', 'Hasbro', 'LEGO',
];

// ── Rating options ─────────────────────────────────────────────
const RATING_OPTIONS = [
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' },
];

// ── Discount options ───────────────────────────────────────────
const DISCOUNT_OPTIONS = [
  { label: '10% or more', value: '10' },
  { label: '25% or more', value: '25' },
  { label: '50% or more', value: '50' },
];

// ── Collapsible section component ────────────────────────────
const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center px-4 py-3 text-left"
      >
        <span className="text-[13px] font-semibold text-[#212121] uppercase tracking-wider">
          {title}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-[#878787]" />
          : <ChevronDown className="w-3.5 h-3.5 text-[#878787]" />
        }
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

// ── Flipkart-style checkbox ────────────────────────────────────
const FilterCheckbox: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ id, label, checked, onChange }) => (
  <label
    htmlFor={id}
    className="flex items-center gap-2 py-1 cursor-pointer group"
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-3.5 w-3.5 text-primary-600 border-gray-400 rounded-sm cursor-pointer accent-primary-600"
    />
    <span className={`text-[13px] leading-snug ${checked ? 'text-primary-600 font-medium' : 'text-[#333] group-hover:text-primary-600'}`}>
      {label}
    </span>
  </label>
);

// ── Main FiltersSidebar ────────────────────────────────────────
export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  isCategoriesLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read current filter state from URL ─────────────────────
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const selectedBrands     = searchParams.get('brand')?.split(',').filter(Boolean) || [];
  const selectedRating     = searchParams.get('minRating') || '';
  const isInStock          = searchParams.get('inStock') === 'true';
  const selectedDiscount   = searchParams.get('minDiscount') || '';

  // ── Local brand search ──────────────────────────────────────
  const [brandSearch, setBrandSearch] = useState('');
  const filteredBrands = brandSearch
    ? KNOWN_BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
    : KNOWN_BRANDS;

  // ── Helper: update param and reset page ────────────────────
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page'); // Always reset to page 1 on filter change
    setSearchParams(next);
  };

  // ── Category toggle ────────────────────────────────────────
  const handleCategoryChange = (id: string) => {
    setParam('categoryId', selectedCategoryId === id ? null : id);
  };

  // ── Brand multi-select toggle ──────────────────────────────
  const handleBrandToggle = (brand: string) => {
    const current = new Set(selectedBrands);
    if (current.has(brand)) current.delete(brand);
    else current.add(brand);
    setParam('brand', current.size > 0 ? Array.from(current).join(',') : null);
  };

  // ── Rating radio ────────────────────────────────────────────
  const handleRatingChange = (value: string) => {
    setParam('minRating', selectedRating === value ? null : value);
  };

  // ── Discount radio ──────────────────────────────────────────
  const handleDiscountChange = (value: string) => {
    setParam('minDiscount', selectedDiscount === value ? null : value);
  };

  // ── Price submit ────────────────────────────────────────────
  const handlePriceChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const min = fd.get('minPrice') as string;
    const max = fd.get('maxPrice') as string;
    const next = new URLSearchParams(searchParams);
    if (min) next.set('minPrice', min); else next.delete('minPrice');
    if (max) next.set('maxPrice', max); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  // ── Clear all filters ───────────────────────────────────────
  const clearFilters = () => {
    const next = new URLSearchParams();
    // preserve search param if present
    if (searchParams.get('search')) next.set('search', searchParams.get('search')!);
    setSearchParams(next);
  };

  const hasFilters = ['categoryId', 'brand', 'minRating', 'inStock', 'minDiscount', 'minPrice', 'maxPrice']
    .some(k => searchParams.has(k));

  return (
    <div className="bg-white w-full select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-[16px] font-semibold text-[#212121]">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[12px] text-primary-600 font-semibold uppercase tracking-wide hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────────── */}
      <FilterSection title="Category">
        {isCategoriesLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            ))}
          </div>
        ) : (
          <ul className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {categories.map(cat => (
              <li key={cat.id}>
                <FilterCheckbox
                  id={`cat-${cat.id}`}
                  label={cat.name}
                  checked={selectedCategoryId === cat.id}
                  onChange={() => handleCategoryChange(cat.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </FilterSection>

      {/* ── PRICE ──────────────────────────────────────────────── */}
      <FilterSection title="Price">
        <form onSubmit={handlePriceChange} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              name="minPrice"
              type="number"
              min={0}
              placeholder="Min"
              defaultValue={searchParams.get('minPrice') || ''}
              className="w-full px-2 py-1.5 border border-gray-300 text-[13px] rounded-sm focus:outline-none focus:border-primary-600"
            />
            <span className="text-[#878787] text-xs flex-shrink-0">to</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              placeholder="Max"
              defaultValue={searchParams.get('maxPrice') || ''}
              className="w-full px-2 py-1.5 border border-gray-300 text-[13px] rounded-sm focus:outline-none focus:border-primary-600"
            />
          </div>
          <button
            type="submit"
            className="w-full text-[12px] font-semibold text-primary-600 border border-primary-200 py-1.5 rounded-sm hover:bg-blue-50 uppercase tracking-wide transition-colors"
          >
            Go
          </button>
        </form>
      </FilterSection>

      {/* ── BRANDS ─────────────────────────────────────────────── */}
      <FilterSection title="Brand">
        {/* Brand search box */}
        <input
          type="text"
          value={brandSearch}
          onChange={e => setBrandSearch(e.target.value)}
          placeholder="Search brands"
          className="w-full px-2 py-1.5 border border-gray-200 text-[12px] rounded-sm mb-2 focus:outline-none focus:border-primary-600"
        />
        <ul className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
          {filteredBrands.map(brand => (
            <li key={brand}>
              <FilterCheckbox
                id={`brand-${brand}`}
                label={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
              />
            </li>
          ))}
          {filteredBrands.length === 0 && (
            <li className="text-[12px] text-[#878787] py-1">No brands found</li>
          )}
        </ul>
      </FilterSection>

      {/* ── CUSTOMER RATING ─────────────────────────────────────── */}
      <FilterSection title="Customer Rating">
        <ul className="space-y-0.5">
          {RATING_OPTIONS.map(opt => (
            <li key={opt.value}>
              <label
                htmlFor={`rating-${opt.value}`}
                className="flex items-center gap-2 py-1 cursor-pointer group"
              >
                <input
                  id={`rating-${opt.value}`}
                  type="checkbox"
                  checked={selectedRating === opt.value}
                  onChange={() => handleRatingChange(opt.value)}
                  className="h-3.5 w-3.5 accent-primary-600 cursor-pointer rounded-sm border-gray-400"
                />
                <span className={`text-[13px] ${selectedRating === opt.value ? 'text-primary-600 font-medium' : 'text-[#333] group-hover:text-primary-600'}`}>
                  {opt.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── AVAILABILITY ────────────────────────────────────────── */}
      <FilterSection title="Availability" defaultOpen={false}>
        <FilterCheckbox
          id="instock-filter"
          label="In Stock Only"
          checked={isInStock}
          onChange={() => setParam('inStock', isInStock ? null : 'true')}
        />
      </FilterSection>

      {/* ── DISCOUNT ────────────────────────────────────────────── */}
      <FilterSection title="Discount">
        <ul className="space-y-0.5">
          {DISCOUNT_OPTIONS.map(opt => (
            <li key={opt.value}>
              <label
                htmlFor={`disc-${opt.value}`}
                className="flex items-center gap-2 py-1 cursor-pointer group"
              >
                <input
                  id={`disc-${opt.value}`}
                  type="checkbox"
                  checked={selectedDiscount === opt.value}
                  onChange={() => handleDiscountChange(opt.value)}
                  className="h-3.5 w-3.5 accent-primary-600 cursor-pointer rounded-sm border-gray-400"
                />
                <span className={`text-[13px] ${selectedDiscount === opt.value ? 'text-primary-600 font-medium' : 'text-[#333] group-hover:text-primary-600'}`}>
                  {opt.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* ── NEW ARRIVALS ─────────────────────────────────────────── */}
      <FilterSection title="Sort By" defaultOpen={false}>
        <ul className="space-y-0.5">
          {[
            { label: 'Newest First',      value: 'newest'     },
            { label: 'Top Rated',         value: 'rating'     },
            { label: 'Price: Low to High',value: 'price_asc'  },
            { label: 'Price: High to Low',value: 'price_desc' },
          ].map(opt => (
            <li key={opt.value}>
              <label
                htmlFor={`sort-${opt.value}`}
                className="flex items-center gap-2 py-1 cursor-pointer group"
              >
                <input
                  id={`sort-${opt.value}`}
                  type="radio"
                  name="sort"
                  checked={searchParams.get('sortBy') === opt.value}
                  onChange={() => setParam('sortBy', opt.value)}
                  className="h-3.5 w-3.5 accent-primary-600 cursor-pointer"
                />
                <span className={`text-[13px] ${searchParams.get('sortBy') === opt.value ? 'text-primary-600 font-medium' : 'text-[#333] group-hover:text-primary-600'}`}>
                  {opt.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  );
};
