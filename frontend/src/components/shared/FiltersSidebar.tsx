import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category } from '../../types/api.types';
import { Input } from '../ui/Input';

interface FiltersSidebarProps {
  categories: Category[];
  isCategoriesLoading: boolean;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ categories, isCategoriesLoading }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCategoryChange = (categoryId: string) => {
    if (searchParams.get('categoryId') === categoryId) {
      searchParams.delete('categoryId');
    } else {
      searchParams.set('categoryId', categoryId);
    }
    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const handlePriceChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get('minPrice') as string;
    const max = formData.get('maxPrice') as string;

    if (min) searchParams.set('minPrice', min);
    else searchParams.delete('minPrice');

    if (max) searchParams.set('maxPrice', max);
    else searchParams.delete('maxPrice');

    searchParams.delete('page');
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="bg-white border-b sm:border-none shadow-sm sm:shadow-none w-full pb-4 sm:pb-0">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-[18px] font-medium text-[#212121]">Filters</h2>
        {hasFilters && (
          <button 
            onClick={clearFilters}
            className="text-[12px] text-primary-600 font-medium uppercase tracking-wide"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-200">
        <h3 className="text-[13px] font-medium text-[#212121] uppercase tracking-wider mb-3">Categories</h3>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-3 bg-gray-200 w-3/4"></div>)}
          </div>
        ) : (
          <ul className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((category) => (
              <li key={category.id} className="flex items-start">
                <input
                  id={`cat-${category.id}`}
                  type="checkbox"
                  checked={searchParams.get('categoryId') === category.id}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-sm cursor-pointer"
                />
                <label htmlFor={`cat-${category.id}`} className="ml-3 text-[14px] text-[#212121] cursor-pointer hover:text-primary-600">
                  {category.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-[13px] font-medium text-[#212121] uppercase tracking-wider mb-3">Price</h3>
        <form onSubmit={handlePriceChange} className="space-y-3">
          <div className="flex items-center space-x-2">
            <Input 
              name="minPrice" 
              type="number" 
              placeholder="Min" 
              defaultValue={searchParams.get('minPrice') || ''}
              className="py-1 text-sm h-8"
            />
            <span className="text-gray-400 text-xs">to</span>
            <Input 
              name="maxPrice" 
              type="number" 
              placeholder="Max" 
              defaultValue={searchParams.get('maxPrice') || ''}
              className="py-1 text-sm h-8"
            />
          </div>
          <button type="submit" className="w-full text-xs font-medium text-primary-600 border border-gray-200 py-1.5 rounded-sm hover:bg-gray-50 uppercase tracking-wide">
            Apply
          </button>
        </form>
      </div>
    </div>
  );
};
