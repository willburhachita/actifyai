"use client";

import { useCallback, useEffect, useState } from "react";
import type { EbayItemSummary, EbaySearchResult, EbayItemDetail } from "@/lib/ebay/client";
import { EBAY_CATEGORIES, type EbayCategory } from "@/lib/ebay/client";

export type { EbayItemSummary, EbayItemDetail, EbayCategory };
export { EBAY_CATEGORIES };

export function useEbaySearch(defaultCategory: EbayCategory = "electronics") {
  const [category, setCategory] = useState<EbayCategory>(defaultCategory);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<EbayItemSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<EbayItemSummary | null>(null);
  const [itemDetail, setItemDetail] = useState<EbayItemDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);

  const search = useCallback(async (q?: string, cat?: EbayCategory) => {
    setLoading(true);
    setError(null);
    const targetCategory = cat ?? category;
    const targetQuery = q ?? query;

    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: "0",
      });
      if (targetQuery) params.set("q", targetQuery);
      params.set("category_ids", EBAY_CATEGORIES[targetCategory].id);

      const resp = await fetch(`/api/ebay/search?${params}`);
      if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
      const data: EbaySearchResult & { _mock?: boolean } = await resp.json();
      setItems(data.itemSummaries ?? []);
      setTotal(data.total ?? 0);
      setIsMock(data._mock === true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  // Auto-search when category changes
  useEffect(() => {
    void search(undefined, category);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const selectItem = useCallback(async (item: EbayItemSummary) => {
    setSelectedItem(item);
    setItemDetail(null);
    setDetailLoading(true);
    try {
      const resp = await fetch(`/api/ebay/item/${encodeURIComponent(item.itemId)}`);
      if (!resp.ok) throw new Error("Item detail failed");
      const detail: EbayItemDetail = await resp.json();
      setItemDetail(detail);
    } catch {
      // Detail is optional, fall back to summary
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    setItemDetail(null);
  }, []);

  return {
    category, setCategory,
    query, setQuery,
    items, total,
    loading, error, isMock,
    selectedItem, itemDetail, detailLoading,
    selectItem, clearSelection,
    search,
  };
}
