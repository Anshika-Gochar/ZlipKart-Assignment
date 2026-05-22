export const ProductSkeleton = () => {
  return (
    <div className="bg-white p-4 h-full animate-pulse border border-transparent">
      <div className="h-48 sm:h-56 bg-gray-200 mb-4 w-full"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded-sm w-full"></div>
        <div className="h-3 bg-gray-200 rounded-sm w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-sm w-16 mt-2"></div>
        <div className="h-5 bg-gray-200 rounded-sm w-1/2 mt-4"></div>
      </div>
    </div>
  );
};
