'use client';

import React, { useState } from 'react';
import {
  Search,
  Star,
  MapPin,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import type { StoredEvent, VendorItem } from '@/lib/storage';

export default function VendorsDirectoryView({
  event,
  onVendorUpdated,
}: {
  event: StoredEvent;
  onVendorUpdated?: (updated: StoredEvent) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vendors, setVendors] = useState<VendorItem[]>(event.vendors || []);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [activeModalVendor, setActiveModalVendor] = useState<VendorItem | null>(null);

  const categories = ['All', 'Venue', 'Catering', 'Photography', 'Decoration', 'Entertainment'];

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || v.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  function handleRequestQuote(vendorId: string) {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, quoteRequested: !v.quoteRequested } : v
    );
    setVendors(updated);
    if (onVendorUpdated) {
      onVendorUpdated({
        ...event,
        vendors: updated,
      });
    }
  }

  function handleToggleBooking(vendorId: string) {
    const updated = vendors.map((v) =>
      v.id === vendorId ? { ...v, booked: !v.booked } : v
    );
    setVendors(updated);
    if (onVendorUpdated) {
      onVendorUpdated({
        ...event,
        vendors: updated,
      });
    }
  }

  function toggleBookmark(id: string) {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls: Search & Category Filter (Screen 7 Blueprint) */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or location..."
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid (Screen 7 Blueprint) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vendor) => {
          const isBookmarked = bookmarkedIds[vendor.id];
          return (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(vendor.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 hover:text-violet-600 flex items-center justify-center shadow-xs transition"
                  >
                    <Bookmark
                      size={14}
                      className={isBookmarked ? 'fill-violet-600 text-violet-600' : ''}
                    />
                  </button>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-violet-600/90 text-white px-3 py-1 text-xs font-bold backdrop-blur-md">
                      {vendor.category}
                    </span>
                  </div>

                  {vendor.booked && (
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-xs">
                        <CheckCircle2 size={12} /> Booked
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{vendor.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-900">{vendor.rating}</span>
                      <span className="text-[10px] text-slate-400">({vendor.reviewCount})</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Estimated Fee</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{(vendor.priceMinor / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalVendor(vendor)}
                  className="rounded-full border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestQuote(vendor.id)}
                  className={`rounded-full py-2 px-3 text-xs font-bold transition text-center ${
                    vendor.quoteRequested
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-violet-600 text-white hover:bg-violet-700 shadow-xs'
                  }`}
                >
                  {vendor.quoteRequested ? 'Quote Sent ✓' : 'Request Quote'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vendor Details Modal */}
      {activeModalVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-5 p-6 animate-in zoom-in-95 duration-200">
            <div className="h-44 -mx-6 -mt-6 relative bg-slate-100">
              <img
                src={activeModalVendor.image}
                alt={activeModalVendor.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalVendor(null)}
                className="absolute top-4 right-4 bg-slate-900/60 text-white rounded-full p-1.5 hover:bg-slate-900"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  {activeModalVendor.category}
                </span>
                <span className="font-black text-lg text-slate-900">
                  ₹{(activeModalVendor.priceMinor / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">{activeModalVendor.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeModalVendor.location} • ★ {activeModalVendor.rating} ({activeModalVendor.reviewCount} verified reviews)</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Provides full-service professional event assistance with verified credentials, customer guarantees, and direct communication support.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  handleToggleBooking(activeModalVendor.id);
                  setActiveModalVendor(null);
                }}
                className={`flex-1 rounded-full py-2.5 text-xs font-bold ${
                  activeModalVendor.booked
                    ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {activeModalVendor.booked ? 'Cancel Booking' : 'Mark as Booked'}
              </button>
              <button
                onClick={() => setActiveModalVendor(null)}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

