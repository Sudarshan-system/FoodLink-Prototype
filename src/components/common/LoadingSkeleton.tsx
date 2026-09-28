import React from 'react';

export const ListingCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-harbor-200 dark:bg-harbor-700 rounded-lg w-1/3"></div>
        <div className="h-6 bg-harbor-200 dark:bg-harbor-700 rounded-full w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-harbor-200 dark:bg-harbor-700 rounded-lg w-3/4"></div>
        <div className="h-3 bg-harbor-100 dark:bg-harbor-750 rounded-lg w-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="h-10 bg-harbor-100 dark:bg-harbor-750 rounded-xl"></div>
        <div className="h-10 bg-harbor-100 dark:bg-harbor-750 rounded-xl"></div>
      </div>
      <div className="pt-3 border-t border-harbor-100 dark:border-harbor-700 flex justify-between items-center">
        <div className="h-4 bg-harbor-200 dark:bg-harbor-700 rounded-lg w-1/4"></div>
        <div className="h-9 bg-harbor-200 dark:bg-harbor-700 rounded-xl w-28"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-harbor-100 dark:border-harbor-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-harbor-200 dark:bg-harbor-700 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};
