import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden flex flex-col h-full animate-pulse-soft">
      <div className="shimmer aspect-square w-full"></div>
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex justify-between">
          <div className="shimmer h-4 w-16 rounded"></div>
          <div className="shimmer h-4 w-12 rounded"></div>
        </div>
        <div className="shimmer h-6 w-3/4 rounded mt-1"></div>
        <div className="space-y-2 mt-2">
          <div className="shimmer h-4 w-full rounded"></div>
          <div className="shimmer h-4 w-5/6 rounded"></div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/50">
          <div className="shimmer h-8 w-20 rounded"></div>
          <div className="shimmer h-10 w-24 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4"><div className="shimmer h-4 w-20 rounded"></div></td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="shimmer h-10 w-10 rounded-full"></div>
          <div className="space-y-2">
            <div className="shimmer h-4 w-32 rounded"></div>
            <div className="shimmer h-3 w-24 rounded"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="shimmer h-4 w-24 rounded"></div></td>
      <td className="px-6 py-4"><div className="shimmer h-4 w-16 rounded"></div></td>
      <td className="px-6 py-4"><div className="shimmer h-6 w-20 rounded-full"></div></td>
      <td className="px-6 py-4"><div className="shimmer h-8 w-8 rounded"></div></td>
    </tr>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-6">
      <div className="shimmer h-24 w-24 rounded-full"></div>
      <div className="space-y-3">
        <div className="shimmer h-8 w-48 rounded"></div>
        <div className="shimmer h-4 w-32 rounded"></div>
        <div className="flex gap-4 mt-2">
          <div className="shimmer h-6 w-20 rounded-full"></div>
          <div className="shimmer h-6 w-32 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between">
        <div className="space-y-2"><div className="shimmer h-3 w-16 rounded"></div><div className="shimmer h-5 w-24 rounded"></div></div>
        <div className="space-y-2"><div className="shimmer h-3 w-12 rounded"></div><div className="shimmer h-5 w-20 rounded"></div></div>
        <div className="space-y-2"><div className="shimmer h-3 w-16 rounded"></div><div className="shimmer h-5 w-24 rounded"></div></div>
      </div>
      <div className="p-6">
        <div className="flex gap-4 mb-6"><div className="shimmer h-6 w-24 rounded-full"></div><div className="shimmer h-6 w-24 rounded-full"></div></div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4">
              <div className="shimmer h-20 w-20 rounded-lg"></div>
              <div className="flex-1 space-y-2 py-2">
                <div className="shimmer h-5 w-48 rounded"></div>
                <div className="shimmer h-4 w-24 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
