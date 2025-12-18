// src/pages/customer/ProductGallery.jsx
import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../lib/axiosClient";
import ProductCard from "./ProductCard";
import { X, Menu, ListFilterPlus, Undo2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const DEBOUNCE_MS = 300;
function useDebounce(value, delay = DEBOUNCE_MS) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ProductGallery() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const urlCategoryId = params.get("categoryId") ? Number(params.get("categoryId")) : null;

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Pagination / meta
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters + UI
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [brand, setBrand] = useState("");
  const [availableBrands, setAvailableBrands] = useState([]);

  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const [loading, setLoading] = useState(false);

  // sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse

  // brand panel (desktop hover / mobile click)
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [brandPanelMobileOpen, setBrandPanelMobileOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // API params
  const apiParams = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      categoryId: selectedCategory || undefined,
      brand: brand || undefined,
      minPrice: minPrice != null ? minPrice : undefined,
      maxPrice: maxPrice != null ? maxPrice : undefined,
      sortField,
      sortDirection,
      page,
      size
    }),
    [debouncedKeyword, selectedCategory, brand, minPrice, maxPrice, sortField, sortDirection, page, size]
  );

  // Load categories once
  useEffect(() => {
    let mountedFlag = true;
    axiosClient
      .get("/categories")
      .then((res) => {
        if (!mountedFlag) return;
        const raw = res?.data?.data;
        setCategories(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mountedFlag = false;
    };
  }, []);

  // Main fetch with abort
  useEffect(() => {
    let active = true;
    setLoading(true);

    const controller = new AbortController();
    const params = {};
    Object.entries(apiParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params[k] = v;
    });

    // include global search from URL if present (backwards-compatible)
    const urlParams = new URLSearchParams(location.search);
    const globalSearch = urlParams.get("search");
    if (globalSearch && !params.keyword) params.keyword = globalSearch;

    axiosClient
      .get("/products/filter", { params, signal: controller.signal })
      .then((res) => {
        if (!active) return;
        const body = res.data?.data || {};
        const items = body.items || [];
        setProducts(items);
        setPage(body.page || 0);
        setTotalPages(body.totalPages || 1);
        setTotalItems(body.totalElements || items.length);

        // derive brand list
        const brands = Array.from(new Set(items.map((it) => it.brand).filter(Boolean)));
        setAvailableBrands(brands);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [apiParams, location.search]);

  // suggestions
  useEffect(() => {
    if (!debouncedKeyword || debouncedKeyword.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    axiosClient
      .get("/products/filter", {
        params: { keyword: debouncedKeyword, page: 0, size: 6 },
        signal: controller.signal
      })
      .then((res) => {
        const items = res.data?.data?.items || [];
        setSuggestions(items);
        setShowSuggestions(true);
      })
      .catch(() => {
        setSuggestions([]);
        setShowSuggestions(false);
      });
    return () => controller.abort();
  }, [debouncedKeyword]);

  // reflect URL category changes
  useEffect(() => {
    setSelectedCategory(urlCategoryId);
    setPage(0);
  }, [urlCategoryId]);

  const applyPriceFilter = () => {
    const min = minPriceInput ? Number(minPriceInput) : null;
    const max = maxPriceInput ? Number(maxPriceInput) : null;
    setMinPrice(min);
    setMaxPrice(max);
    setPage(0);
  };

  const resetFilters = () => {
    setKeyword("");
    setBrand("");
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
    setSelectedCategory(null);
    setSortField("createdAt");
    setSortDirection("desc");
    setPage(0);
  };

  const handleSuggestionClick = (product) => {
    setProducts([product]);
    setShowSuggestions(false);
    setSuggestions([]);
    setKeyword(product.productName);
    setSelectedCategory(null);
    setPage(0);
    window.history.pushState({}, "", "/products");
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };
  const nextPage = () => {
    if (page + 1 < totalPages) setPage(page + 1);
  };

  // brand panel handlers
  const openBrandPanel = () => setBrandPanelOpen(true);
  const closeBrandPanel = () => setBrandPanelOpen(false);
  const toggleBrandPanelMobile = () => setBrandPanelMobileOpen((v) => !v);

  const handleBrandSelect = (b) => {
    setBrand(b);
    setPage(0);
    setBrandPanelOpen(false);
    setBrandPanelMobileOpen(false);
  };

  // group brands by categoryName (reliable field)
  const brandsByCategory = useMemo(() => {
    const groups = {
      Laptop: new Set(),
      MacBook: new Set(),
      "PC Components": new Set(),
      Accessories: new Set(),
      Other: new Set()
    };

    products.forEach((p) => {
      const cat = (p.categoryName || "").toLowerCase();
      const b = p.brand ? p.brand.trim() : "";
      if (!b) return;
      if (cat.includes("laptop")) groups.Laptop.add(b);
      else if (cat.includes("macbook")) groups.MacBook.add(b);
      else if (cat.includes("component") || cat.includes("pc")) groups["PC Components"].add(b);
      else if (cat.includes("accessor")) groups.Accessories.add(b);
      else groups.Other.add(b);
    });

    const result = {};
    Object.entries(groups).forEach(([k, set]) => {
      const arr = Array.from(set).sort();
      if (arr.length) result[k] = arr;
    });
    return result;
  }, [products]);

  const toggleSidebarCollapse = () => setSidebarCollapsed((v) => !v);

  return (
    <div
      className="max-w-8xl mx-auto mt-[84px] px-3 md:px-4 transition-opacity duration-500"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {/* Top controls */}
      <div className="sticky top-[60px] z-30 bg-[rgb(248,249,251)] pb-4 pt-2  shadow-[0_2px_6px_rgba(0,0,0,0.06)] ">
        <div className="flex items-center gap-3 mb-4">
          {/* mobile: hamburger for filters */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn-outline p-2 rounded-md shadow-sm"
              aria-label="Open filters"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Search: full-width left */}
          <div className="flex-1">
            <div className="relative z-[60]">
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") setPage(0); }}
                placeholder="Search for products, brands, parts..."
                className="w-full rounded-lg p-3 border bg-white"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow-lg max-h-60 overflow-auto z-50">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-sm">{s.productName}</div>
                        <div className="text-xs text-gray-500">{s.brand}</div>
                      </div>
                      <div className="text-xs text-gray-400">₹{s.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brands pill + Sort */}
          <div className="flex items-center gap-3 ml-3">
            {/* Brands pill (hover opens panel on desktop; click toggles on mobile) */}
            <div
              className="relative"
              onMouseEnter={openBrandPanel}
              onMouseLeave={closeBrandPanel}
            >
              <button
                onClick={toggleBrandPanelMobile}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-sm font-medium hidden sm:block"
                aria-haspopup="true"
                aria-expanded={brandPanelOpen || brandPanelMobileOpen}
              >
                Brands
              </button>

              {/* Brand panel */}
              {(brandPanelOpen || brandPanelMobileOpen) && (
                <div className="absolute right-0 mt-2 z-50">
                  <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-4 w-auto min-w-[320px] max-w-[720px]">
                    {Object.keys(brandsByCategory).length === 0 ? (
                      <div className="text-sm text-gray-500">No brands found</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {Object.entries(brandsByCategory).map(([catName, brandList]) => (
                          <div key={catName} className="min-w-[140px]">
                            <div className="text-sm font-semibold mb-2">{catName}</div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleBrandSelect("")}
                                className="text-xs text-gray-500 text-left"
                              >
                                All {catName}
                              </button>
                              {brandList.map((b) => (
                                <button
                                  key={b}
                                  onClick={() => handleBrandSelect(b)}
                                  className={`text-sm text-left hover:text-indigo-600 ${brand === b ? "font-semibold text-indigo-700" : "text-gray-700"}`}
                                >
                                  {b}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-xs text-gray-500">Showing {availableBrands.length} brands</div>
                      <div>
                        <button
                          onClick={() => { setBrand(""); setPage(0); setBrandPanelOpen(false); setBrandPanelMobileOpen(false); }}
                          className="px-3 py-1 text-sm btn-outline rounded-md"
                        >
                          Clear Brand
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 hidden sm:inline">Sort by:</span>
              <select
                value={`${sortField}:${sortDirection}`}
                onChange={(e) => {
                  const [sf, sd] = e.target.value.split(":");
                  setSortField(sf);
                  setSortDirection(sd);
                  setPage(0);
                }}
                className="px-2 py-2 rounded-lg border bg-white"
              >
                <option value="createdAt:desc">Newest</option>
                <option value="createdAt:asc">Oldest</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

     

      <div className="flex gap-6 mt-4">
        {/* Desktop sidebar  */}
        {!sidebarCollapsed && (
          <aside
            className="hidden lg:block w-60 sticky top-[130px] self-start h-[calc(100vh-100px)] overflow-auto transition-transform duration-300"
            data-lenis-prevent
          >
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] h-full">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Categories</h3>
                <div className="flex items-center gap-2">
                  <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-700">Reset</button>
                  <button onClick={toggleSidebarCollapse} className="text-sm text-gray-500 hover:text-gray-700">Collapse</button>
                </div>
              </div>

              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => { setSelectedCategory(null); setPage(0); window.history.pushState({}, "", "/products"); }}
                    className={`text-left w-full ${selectedCategory === null ? "font-semibold text-indigo-700" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    All Products
                  </button>
                </li>

                { Array.isArray(categories) && categories.map(c => (
                  <li key={c.categoryId}>
                    <button
                      onClick={() => { setSelectedCategory(c.categoryId); setPage(0); window.history.pushState({}, "", `/products?categoryId=${c.categoryId}`); }}
                      className={`text-left w-full ${selectedCategory === c.categoryId ? "font-semibold text-indigo-700" : "text-gray-600 hover:text-indigo-600"}`}
                    >
                      {c.categoryName}
                    </button>
                  </li>
                ))}
              </ul>

              <hr className="my-4" />

              <h3 className="font-semibold mb-2">Price</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={minPriceInput}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "") return setMinPriceInput("");
                    const n = Math.max(1, Number(v));
                    setMinPriceInput(n);
                  }}
                  placeholder="Min"
                  className="input w-1/2"
                />

                <input
                  type="number"
                  min="1"
                  value={maxPriceInput}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "") return setMaxPriceInput("");
                    const n = Math.max(1, Number(v));
                    setMaxPriceInput(n);
                  }}
                  placeholder="Max"
                  className="input w-1/2"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={applyPriceFilter} className="btn-primary px-3 py-1">Apply</button>
                <button
                  onClick={() => {
                    setMinPriceInput("");
                    setMaxPriceInput("");
                    setMinPrice(null);
                    setMaxPrice(null);
                    setPage(0);
                  }}
                  className="btn-outline px-3 py-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Collapsed desktop sidebar stub */}
        {sidebarCollapsed && (
          <div className="hidden lg:flex flex-col items-center gap-2 w-12 sticky top-[150px] self-start">
            <button title="Expand filters" onClick={toggleSidebarCollapse} className="p-2 rounded bg-white border text-sm"><ListFilterPlus /></button>
            <button title="Reset filters" onClick={resetFilters} className="p-2 rounded bg-white border text-sm"><Undo2 /></button>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">
              {selectedCategory ? (categories.find(x => x.categoryId === selectedCategory)?.categoryName || "Category") : "All Products"}
            </h1>
            <div className="text-sm text-gray-500">{totalItems} products</div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: size }).map((_, i) => (
                <div key={i} className="animate-pulse h-64 bg-gray-100 rounded-xl" />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No products found</div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-500">Page {page + 1} of {totalPages}</div>
            <div className="flex items-center gap-3">
              <button onClick={prevPage} disabled={page === 0} className="btn-outline px-4 py-2 disabled:opacity-50">◀ Prev</button>
              <div className="text-sm text-gray-700">{page + 1} / {totalPages}</div>
              <button onClick={nextPage} disabled={page + 1 >= totalPages} className="btn-outline px-4 py-2 disabled:opacity-50">Next ▶</button>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl border-r border-gray-100 transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-gray-100"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Categories</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => { setSelectedCategory(null); setPage(0); setSidebarOpen(false); }} className="text-left w-full text-gray-600 hover:text-indigo-600">All Products</button>
                </li>
                {categories.map((c) => (
                  <li key={c.categoryId}>
                    <button onClick={() => { setSelectedCategory(c.categoryId); setPage(0); setSidebarOpen(false); }} className="text-left w-full text-gray-600 hover:text-indigo-600">{c.categoryName}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-medium mb-2">Price</div>
              <div className="flex gap-2">
                <input type="number" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} placeholder="Min" className="input w-1/2" />
                <input type="number" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} placeholder="Max" className="input w-1/2" />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { applyPriceFilter(); setSidebarOpen(false); }} className="btn-primary px-3 py-1">Apply</button>
                <button onClick={() => { setMinPriceInput(""); setMaxPriceInput(""); setMinPrice(null); setMaxPrice(null); }} className="btn-outline px-3 py-1">Clear</button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => { resetFilters(); setSidebarOpen(false); }} className="text-sm text-gray-500">Reset</button>
              <div className="text-xs text-gray-400">{totalItems} results</div>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity" />}
    </div>
  );
}
