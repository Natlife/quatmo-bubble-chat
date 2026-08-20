import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function Pagination({ totalItems, pageSize, currentPage, onPageChange, className = "" }) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex items-center justify-between gap-2 pt-3 text-xs text-slate-500 border-t border-slate-100 ${className}`}>
      <span>
        Showing <strong className="font-semibold text-slate-700">{startItem}-{endItem}</strong> of <strong className="font-semibold text-slate-700">{totalItems}</strong>
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 font-medium text-slate-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
