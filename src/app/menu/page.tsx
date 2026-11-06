"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import Footer from "@/components/Footer";
import { useApp } from "@/lib/context";
import { useMenu } from "@/hooks/useMenu";

type SortKey = "featured" | "newest" | "price-low" | "price-high";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const labelFor = (cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1);

function MenuContent({
  initialCategory,
  initialQuery,
}: {
  initialCategory: string;
  initialQuery: string;
}) {
  const { cart, addToCart, updateQuantity } = useApp();
  const { menuItems: rawMenuItems, isLoading } = useMenu();

  const normalizedCategory =
    !initialCategory || initialCategory === "new" || initialCategory === "all"
      ? "all"
      : initialCategory;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState(normalizedCategory);
  const [sort, setSort] = useState<SortKey>(
    initialCategory === "new" ? "newest" : "featured"
  );

  const isSearching = searchQuery.trim().length > 0;

  const menu = useMemo(() => {
    if (!Array.isArray(rawMenuItems)) return [];
    return [...rawMenuItems]
      .filter((item) => item && (item.available || item.isLaunchingSoon))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawMenuItems]);

  const catalog = useMemo(() => {
    return menu.filter((i) => isSearching || !i.searchOnly);
  }, [menu, isSearching]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of menu) {
      if (item.searchOnly) continue;
      const category = (item.category || "").trim().toLowerCase();
      if (!category) continue;
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([category]) => category);
  }, [menu]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of catalog) {
      const category = (item.category || "").trim().toLowerCase();
      if (!category) continue;
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return counts;
  }, [catalog]);

  const effectiveCategory =
    activeCategory !== "all" && categories.length > 0 && !categories.includes(activeCategory)
      ? "all"
      : activeCategory;

  const highlightedCategory = effectiveCategory !== "all" ? effectiveCategory : categories[0];

  const filtered = useMemo(() => {
    let items = [...catalog];

    if (effectiveCategory !== "all") {
      items = items.filter((i) => (i.category || "").toLowerCase() === effectiveCategory);
    }

    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case "price-low":
        return items.sort((a, b) => a.price - b.price);
      case "price-high":
        return items.sort((a, b) => b.price - a.price);
      case "newest":
        return items.sort(
          (a, b) => (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0)
        );
      default:
        return items;
    }
  }, [catalog, effectiveCategory, isSearching, searchQuery, sort]);

  const heading = isSearching
    ? `Results for “${searchQuery.trim()}”`
    : effectiveCategory === "all"
    ? "Catalog Release"
    : `${labelFor(effectiveCategory)} Collection`;

  return (
    <div className="kl-page shop-page">
      <style>{`
        .shop-head {
          padding: clamp(30px, 5vw, 56px) 0 clamp(20px, 3vw, 30px);
          border-bottom: 1px solid var(--kl-line-soft);
        }
        .shop-head h1 {
          font-family: "Outfit", sans-serif;
          font-size: clamp(2rem, 6vw, 4.4rem);
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 0.92;
          text-transform: uppercase;
          margin: 0;
          color: var(--kl-text);
          word-break: break-word;
        }
        .shop-head-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
        }
        .shop-count {
          font-size: 0.64rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--kl-muted);
          font-weight: 600;
        }

        .shop-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          border: 1px solid var(--kl-line);
        }

        .shop-stats > div {
          min-width: 130px;
          padding: 16px 20px;
          border-right: 1px solid var(--kl-line);
        }

        .shop-stats > div:last-child { border-right: 0; }

        .shop-stat-label {
          display: block;
          margin-bottom: 5px;
          font-size: 0.54rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--kl-muted);
        }

        .shop-stats strong {
          display: block;
          font-family: "Outfit", sans-serif;
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.04em;
          text-transform: uppercase;
          color: var(--kl-text);
          line-height: 1;
        }

        .shop-controls {
          position: sticky;
          top: 64px;
          z-index: 90;
          background: rgba(8, 8, 8, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--kl-line);
        }
        .shop-controls-inner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 0;
        }

        .shop-search {
          position: relative;
          flex: 0 0 clamp(96px, 14vw, 140px);
          min-width: 96px;
        }
        .shop-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--kl-muted);
          pointer-events: none;
        }
        .shop-search input {
          width: 100%;
          height: 40px;
          padding: 0 36px 0 38px;
          border-radius: 99px;
          border: 1px solid var(--kl-line);
          background: transparent;
          color: var(--kl-text);
          font-family: inherit;
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .shop-search input::placeholder { color: #6E6E6A; }
        .shop-search input:focus { border-color: rgba(255, 255, 255, 0.5); }
        .shop-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: var(--kl-text);
          cursor: pointer;
        }

        .shop-cats {
          display: flex;
          align-items: center;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          flex: 1;
          min-width: 0;
        }
        .shop-cats::-webkit-scrollbar { display: none; }

        .shop-chip {
          flex-shrink: 0;
          border: 1px solid var(--kl-line);
          background: transparent;
          color: var(--kl-muted);
          border-radius: 4px;
          padding: 10px 14px;
          font-family: inherit;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .shop-chip:hover { color: var(--kl-text); border-color: rgba(255, 255, 255, 0.4); }
        .shop-chip.active {
          background: var(--kl-text);
          color: var(--kl-bg);
          border-color: var(--kl-text);
        }

        .shop-sort {
          flex-shrink: 0;
          height: 40px;
          padding: 0 32px 0 14px;
          border-radius: 99px;
          border: 1px solid var(--kl-line);
          background: #0A0A0A;
          color: var(--kl-text);
          font-family: inherit;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239A9A96' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }

        .shop-body {
          padding: clamp(20px, 3vw, 34px) 0 clamp(60px, 8vw, 100px);
        }

        .shop-skel {
          aspect-ratio: 3 / 4;
          background: linear-gradient(90deg, #141414 25%, #1D1D1D 50%, #141414 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }

        .shop-empty {
          text-align: center;
          padding: clamp(60px, 12vw, 120px) 20px;
          color: var(--kl-muted);
        }
        .shop-empty h3 {
          font-family: "Outfit", sans-serif;
          color: var(--kl-text);
          text-transform: uppercase;
          letter-spacing: -0.03em;
          font-size: 1.3rem;
          margin: 0 0 8px;
        }
        .shop-empty p { font-size: 0.85rem; margin: 0 0 22px; }
        .shop-empty button {
          border: 1px solid var(--kl-line);
          background: transparent;
          color: var(--kl-text);
          border-radius: 99px;
          padding: 12px 26px;
          font-family: inherit;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .shop-empty button:hover { background: var(--kl-text); color: var(--kl-bg); }

        @media (max-width: 860px) {
          .shop-head-meta { align-items: stretch; flex-direction: column; }
          .shop-controls-inner { flex-wrap: wrap; gap: 8px; }
          .shop-search { flex: 1 1 100%; order: 1; }
          .shop-cats { order: 3; flex-basis: 100%; }
          .shop-sort { order: 2; margin-left: auto; }
        }
        @media (max-width: 480px) {
          .shop-controls { top: 58px; }
          .shop-sort { font-size: 0.56rem; padding-right: 30px; }
        }
      `}</style>

      <section className="shop-head">
        <div className="kl-container">
          <span className="kl-eyebrow">// Drop archive 04</span>
          <h1>{heading}</h1>
          <div className="shop-head-meta">
            <div className="shop-stats">
              <div>
                <span className="shop-stat-label">Stock status</span>
                <strong>{filtered.length > 0 ? "Limited" : "Waiting"}</strong>
              </div>
              <div>
                <span className="shop-stat-label">Dispatch time</span>
                <strong>24 hours</strong>
              </div>
            </div>
            <span className="shop-count">
              {isLoading
                ? "Loading pieces…"
                : `Showing ${filtered.length} of ${catalog.length}`}
            </span>
          </div>
        </div>
      </section>

      <div className="shop-controls">
        <div className="kl-container">
          <div className="shop-controls-inner">
            <div className="shop-search">
              <Search size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces"
                aria-label="Search pieces"
              />
              {searchQuery && (
                <button
                  className="shop-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="shop-cats">
              <button
                key="all"
                className={`shop-chip${effectiveCategory === "all" ? " active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                All [{catalog.length}]
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`shop-chip${effectiveCategory === cat ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {labelFor(cat)} [{categoryCounts.get(cat) || 0}]
                </button>
              ))}
            </div>

            <select
              className="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort pieces"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: "#0A0A0A" }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="shop-body">
        <div className="kl-container">
          {isLoading ? (
            <div className="kl-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shop-skel" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="kl-grid">
              {filtered.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  cartItem={cart.find((c) => c.item.id === item.id)}
                  onAdd={addToCart}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <h3>Nothing here yet</h3>
              <p>
                {isSearching
                  ? `No pieces match “${searchQuery.trim()}”.`
                  : "This edit is still being curated. Try another category."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setSort("featured");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function MenuRoute() {
  const searchParams = useSearchParams();
  const category = (searchParams.get("category") || "").toLowerCase();
  const query = searchParams.get("q") || "";
  return (
    <MenuContent
      key={`${category}|${query}`}
      initialCategory={category}
      initialQuery={query}
    />
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh", background: "#080808" }} />}>
      <MenuRoute />
    </Suspense>
  );
}
