"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ChevronDown, Minus } from "lucide-react";
import FoodCard from "@/components/FoodCard";
import Footer from "@/components/Footer";
import OnboardingModal from "@/components/OnboardingModal";
import AuthModal from "@/components/AuthModal";
import { useApp } from "@/lib/context";
import { useMenu } from "@/hooks/useMenu";
import type { MenuItem } from "@/lib/types";

type HeroSlide = {
  id: string;
  text: string;
  subText?: string;
  image: string;
  link: string;
};

type BannerSlide = {
  id?: string;
  text?: string;
  subText?: string;
  image?: string;
  link?: string;
  active?: boolean;
};

type BentoSlideGroup = {
  slides?: BannerSlide[];
};

type InitialBanner = {
  bannerSlides?: BannerSlide[];
  bentoSlides?: BentoSlideGroup[];
};

type InitialHomeLayout = {
  heroSectionEnabled?: boolean;
};

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    text: "Zero Gravity // Edition 004",
    subText: "Architectural cuts · Pre-shrunk 450 GSM · Custom-milled terry",
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=2000&q=85",
    link: "/menu",
  },
  {
    id: "fallback-2",
    text: "Heavyweight Staples",
    subText: "Dropped in limited runs · No restocks once sold out",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=2000&q=85",
    link: "/menu?category=hoodies",
  },
  {
    id: "fallback-3",
    text: "The Tee Edit",
    subText: "Boxy silhouettes, everyday foundations",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=2000&q=85",
    link: "/menu?category=tees",
  },
];

/**
 * Homepage content you can change without touching the layout:
 * - Add or remove entries in these arrays.
 * - `image` accepts an Unsplash URL or any uploaded image URL.
 * - `link` controls where a card opens (usually /menu?category=...).
 */
const SHOP_BY_MOOD = [
  {
    index: "01",
    kicker: "Everyday foundations",
    title: "The Tee Edit",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=85",
    link: "/menu?category=tees",
    alt: "ORBT tees and tops",
  },
  {
    index: "02",
    kicker: "Heavyweight layering",
    title: "Soft Structure",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85",
    link: "/menu?category=hoodies",
    alt: "ORBT hoodies and sweats",
  },
  {
    index: "03",
    kicker: "Denim, done right",
    title: "Built to Last",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1000&q=85",
    link: "/menu?category=bottoms",
    alt: "ORBT denim and bottoms",
  },
];

const COMMUNITY_LOOKS = [
  {
    name: "BLCK001",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=700&q=80",
    link: "/menu?category=new",
  },
  {
    name: "BLCK002",
    image: "https://images.unsplash.com/photo-1550246140-29f40b909e5a?auto=format&fit=crop&w=700&q=80",
    link: "/menu?category=tees",
  },
  {
    name: "BLCK003",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=700&q=80",
    link: "/menu?category=bottoms",
  },
];

const INFO_ACCORDION = [
  {
    title: "Order tracking & dispatch",
    body: "Orders dispatch within 24 hours. Tracking links are sent by email and available under Orders once your parcel enters transit.",
  },
  {
    title: "Exchange & returns (7 days)",
    body: "Unworn pieces can be exchanged within 7 days of delivery. Wrong size? Swap it for another size while stock lasts.",
  },
  {
    title: "Size matrix // Boxy silhouette guide",
    body: "ORBT pieces are cut boxy and oversized. If you are between sizes, size down for a regular fit or stay true to size for the full drop.",
  },
  {
    title: "Brand ethos & atelier philosophy",
    body: "We make heavyweight everyday uniforms in limited runs. No seasonal noise — just considered cuts that hold their shape wash after wash.",
  },
];

export default function HomePageClient({
  initialMenu = [],
  initialBanner = {},
  initialHomeLayout = {},
}: {
  initialMenu?: MenuItem[];
  initialBanner?: InitialBanner;
  initialHomeLayout?: InitialHomeLayout;
}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [moodHover, setMoodHover] = useState<{ row: number; col: number } | null>(null);
  const [openInfo, setOpenInfo] = useState(0);
  const [earlyEmail, setEarlyEmail] = useState("");
  const [earlyDone, setEarlyDone] = useState(false);
  const { cart, addToCart, updateQuantity } = useApp();

  const { menuItems: rawMenuItems } = useMenu(initialMenu);

  const menuItems = useMemo(() => {
    const items = Array.isArray(rawMenuItems) ? rawMenuItems : [];
    return [...items]
      .filter((i) => i.available)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [rawMenuItems]);

  const heroSlides = useMemo<HeroSlide[]>(() => {
    const bannerSlides = (initialBanner?.bannerSlides || []).filter(
      (s) => s.active && s.image
    );
    const bentoSlides = (initialBanner?.bentoSlides || [])
      .flatMap((group) => group?.slides || [])
      .filter((s) => s.active && s.image);
    const itemBanners = menuItems
      .filter((i) => i.isBanner && !i.searchOnly && i.image)
      .map((i) => ({
        id: `item-${i.id}`,
        text: i.name,
        subText: i.description || "New drop",
        image: i.image,
        link: `/item/${i.id}`,
      }));

    const custom = [...itemBanners, ...bannerSlides, ...bentoSlides].map((s) => ({
      id: String(s.id || s.image),
      text: s.text || "New Season",
      subText: s.subText || "",
      image: s.image || "",
      link: s.link || "/menu",
    }));

    return custom.length > 0 ? custom : FALLBACK_SLIDES;
  }, [menuItems, initialBanner]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of menuItems) {
      const category = (item.category || "").trim().toLowerCase();
      if (!category) continue;
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([category]) => category);
  }, [menuItems]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: `All [${menuItems.length}]` },
      ...categoryCounts.map((category) => ({
        value: category,
        label: `${category.charAt(0).toUpperCase() + category.slice(1)} [${menuItems.filter((item) => (item.category || "").trim().toLowerCase() === category).length}]`,
      })),
    ],
    [categoryCounts, menuItems]
  );

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNewArrivals = useMemo(
    () =>
      activeCategory === "all"
        ? menuItems.slice(0, 8)
        : menuItems.filter((item) => (item.category || "").trim().toLowerCase() === activeCategory).slice(0, 8),
    [activeCategory, menuItems]
  );

  const { newArrivals, essentials } = useMemo(() => {
    const used = new Set(filteredNewArrivals.map((item) => item.id));
    return {
      newArrivals: filteredNewArrivals,
      essentials: menuItems.filter((item) => !used.has(item.id)).slice(0, 8),
    };
  }, [filteredNewArrivals, menuItems]);

  const moodProductPicks = useMemo(() => {
    const exterior = menuItems.slice(0, 9);
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
      const item = exterior[index % Math.max(1, exterior.length)];
      return {
        index: String(index + 1).padStart(2, "0"),
        item,
      };
    });
  }, [menuItems]);

  const safeHeroIndex = heroIndex < heroSlides.length ? heroIndex : 0;
  const activeSlide = heroSlides[safeHeroIndex] || heroSlides[0];
  const showHero = initialHomeLayout?.heroSectionEnabled !== false;

  return (
    <div className="kl-page">
      <OnboardingModal onLoginClick={() => setShowAuthModal(true)} />
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(uid) => {
            localStorage.setItem("otw_user_id", uid);
            window.location.reload();
          }}
        />
      )}

      {showHero && activeSlide && (
        <section className="kl-hero">
          <Image
            key={activeSlide.id}
            src={activeSlide.image}
            alt={activeSlide.text}
            fill
            priority
            sizes="100vw"
            className="kl-hero-media"
          />

          <div className="kl-hero-inner">
            <div className="kl-hero-top">
              <span>Look {String(safeHeroIndex + 1).padStart(2, "0")} // Atelier campaign</span>
              <span className="kl-hero-side">{heroSlides.length} looks</span>
            </div>

            <div className="kl-hero-bottom">
              <div className="kl-hero-copy">
                <div className="kl-live-stock">
                  <span className="kl-live-dot" />
                  Live stock claim · Limited run
                </div>
                <span className="kl-hero-kicker">
                  {activeSlide.subText || "Drop 004 — Winter 2026"}
                </span>
                <h1 className="kl-hero-title">{activeSlide.text}</h1>
              </div>

              <Link href={activeSlide.link || "/menu"} className="kl-hero-cta">
                Shop the drop <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                className="kl-hero-arrow prev"
                onClick={() => setHeroIndex((safeHeroIndex - 1 + heroSlides.length) % heroSlides.length)}
                aria-label="Previous look"
              >
                ‹
              </button>
              <button
                type="button"
                className="kl-hero-arrow next"
                onClick={() => setHeroIndex((safeHeroIndex + 1) % heroSlides.length)}
                aria-label="Next look"
              >
                ›
              </button>
              <div className="kl-hero-dots">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    className={`kl-hero-dot${idx === safeHeroIndex ? " active" : ""}`}
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Show slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <div className="kl-ticker" aria-hidden="true">
        <div className="kl-ticker-track">
          {[0, 1].map((i) => (
            <span key={i}>
              Complimentary shipping over ₹1999 · Easy 7-day returns · Designed in India · New drop live
            </span>
          ))}
        </div>
      </div>

      <section className="kl-section">
        <div className="kl-container">
          <div className="kl-sec-head">
            <div>
              <span className="kl-eyebrow">01 — Just in</span>
              <h2 className="kl-sec-title">New Arrivals</h2>
            </div>
            <Link href="/menu" className="kl-sec-link">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="kl-home-cats" role="tablist" aria-label="Filter new arrivals">
            {categoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === option.value}
                className={`kl-home-chip${activeCategory === option.value ? " active" : ""}`}
                onClick={() => setActiveCategory(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div key={activeCategory} className="kl-grid kl-animation-grid">
            {newArrivals.length > 0 ? (
              newArrivals.map((item, cardIndex) => (
                <div key={item.id} className="kl-card-motion" style={{ animationDelay: `${cardIndex * 55}ms` }}>
                  <FoodCard
                    item={item}
                    cartItem={cart.find((c) => c.item.id === item.id)}
                    onAdd={addToCart}
                    onUpdateQuantity={updateQuantity}
                  />
                </div>
              ))
            ) : (
              <div className="kl-empty">
                The new collection is arriving shortly. Check back soon.
              </div>
            )}
          </div>

          <div className="kl-more-wrap">
            <Link href="/menu" className="kl-btn-line">
              Shop all pieces <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section id="edit" className="kl-edit">
        <div className="kl-container">
          <div className="kl-edit-head">
            <div>
              <span className="kl-eyebrow">02 — The edit</span>
              <h2 className="kl-sec-title">Shop by mood</h2>
            </div>
            <p className="kl-edit-intro">
              Three ways into the collection — clean foundations, heavyweight
              layering, and denim cut for the long run.
            </p>
          </div>

          <div
            className="kl-dynamic-grid"
            aria-label="Interactive product mood grid"
            style={{
              gridTemplateRows: (() => {
                const hoverSize = 5;
                const other = (12 - hoverSize) / 2;
                return [0, 1, 2].map((r) => `${moodHover?.row === r ? hoverSize : other}fr`).join(" ");
              })(),
              gridTemplateColumns: (() => {
                const hoverSize = 5;
                const other = (12 - hoverSize) / 2;
                return [0, 1, 2].map((c) => `${moodHover?.col === c ? hoverSize : other}fr`).join(" ");
              })(),
            }}
          >
            {moodProductPicks.map((pick, index) => {
              const item = pick.item;
              const row = Math.floor(index / 3);
              const col = index % 3;
              return (
                <div
                  key={`${pick.index}-${item?.id ?? "fallback"}`}
                  className={`kl-dynamic-frame${index === 0 ? " first" : ""}`}
                  data-row={row}
                  data-col={col}
                  style={{
                    gridRow: `${row + 1} / span 1`,
                    gridColumn: `${col + 1} / span 1`,
                  }}
                  onMouseEnter={() => setMoodHover({ row, col })}
                  onMouseLeave={() => setMoodHover(null)}
                >
                  {item ? (
                    <Link href={`/item/${item.id}`} className="kl-dynamic-link" aria-label={item.name}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 33vw, 30vw"
                        className="kl-dynamic-media"
                      />
                    </Link>
                  ) : (
                    <Link href="/menu?category=tees" className="kl-dynamic-link">
                      <span className="kl-dynamic-fallback">ORBT // DROP 004</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="kl-edit-foot">
            <p>
              Limited runs, considered fabrics, no noise. Every piece is designed
              to layer with what you already own.
            </p>
            {/* Hover any frame to expand it. Opens the matching product from your menu. */}
            <Link href="/menu" className="kl-btn-line">
              Shop the full collection <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {essentials.length > 0 && (
        <section className="kl-section">
          <div className="kl-container">
            <div className="kl-sec-head">
              <div>
                <span className="kl-eyebrow">03 — Wardrobe</span>
                <h2 className="kl-sec-title">The Essentials</h2>
              </div>
              <Link href="/menu" className="kl-sec-link">
                View all <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="kl-rail">
              {essentials.map((item) => (
                <div key={item.id} className="kl-rail-card">
                  <FoodCard
                    item={item}
                    cartItem={cart.find((c) => c.item.id === item.id)}
                    onAdd={addToCart}
                    onUpdateQuantity={updateQuantity}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="kl-access">
        <div className="kl-container">
          <div className="kl-access-card">
            <span className="kl-eyebrow"><span className="kl-live-dot" /> Drop 005 — now loading</span>
            <h2>
              Early list.
              <br />
              First look.
            </h2>
            <p>
              Join the ORBT list for a 15-minute head start, private codes, and
              archive releases. No daily noise.
            </p>
            {earlyDone ? (
              <p className="kl-access-done">You're on the list. Watch your inbox.</p>
            ) : (
              <form
                className="kl-access-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (earlyEmail.includes("@")) setEarlyDone(true);
                }}
              >
                <label className="kl-sr-only" htmlFor="early-email">Email address</label>
                <input
                  id="early-email"
                  type="email"
                  required
                  value={earlyEmail}
                  onChange={(e) => setEarlyEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                />
                <button type="submit" aria-label="Join early access">
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </div>

          <div className="kl-accordion">
            {INFO_ACCORDION.map((item, idx) => {
              const open = openInfo === idx;
              return (
                <div key={item.title} className={`kl-accordion-item${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="kl-accordion-trigger"
                    onClick={() => setOpenInfo(open ? -1 : idx)}
                    aria-expanded={open}
                  >
                    {item.title}
                    {open ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <div className="kl-accordion-panel">
                    <p>{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="kl-statement">
        <span className="kl-eyebrow">ORBT</span>
        <h2>
          Worn by the few.
          <br />
          <em>Made for the everyday.</em>
        </h2>
        <Link href="/menu" className="kl-btn-line">
          Shop the collection <ArrowUpRight size={14} />
        </Link>
      </section>

      <Footer />
    </div>
  );
}
