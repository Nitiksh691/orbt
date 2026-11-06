"use client";
import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Minus, X } from "lucide-react";
import { CartItem, MenuItem, SelectedCustomization } from "@/lib/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { getColorOptions, getSizeOptions, type SizeOption } from "@/lib/sizes";

interface FoodCardProps {
  item: MenuItem;
  cartItem?: CartItem;
  onAdd?: (
    item: MenuItem,
    specialInstructions?: string,
    selectedCustomizations?: SelectedCustomization[],
    unitPrice?: number
  ) => void;
  onUpdateQuantity?: (cartItemId: string, qty: number) => void;
}

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

/* ── Size picker — minimal bottom sheet / centred modal ── */
function SizePicker({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, si?: string, sc?: SelectedCustomization[], price?: number) => void;
}) {
  const mounted = useMounted();

  const sizes = getSizeOptions(item);
  const colors = getColorOptions(item);

  const [selected, setSelected] = useState<SizeOption>(
    sizes[0] ?? { name: "One size", price: item.price }
  );
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "Essential Black");

  const handleConfirm = () => {
    onAdd(
      item,
      "",
      [
        { category: "Size", option: selected.name, price: 0 },
        { category: "Colour", option: selectedColor, price: 0 },
      ],
      selected.price
    );
    toast.success(`${item.name} · ${selectedColor} · ${selected.name} added`, { duration: 1400 });
    onClose();
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div onClick={onClose} className="sizepick-backdrop" />
      <div className="sizepick-sheet" role="dialog" aria-modal="true" aria-label="Select size">
        <style>{`
          .sizepick-backdrop {
            position: fixed; inset: 0; z-index: 999999;
            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(6px);
            animation: sizepick-fade 0.2s ease both;
          }
          .sizepick-sheet {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000000;
            max-width: 460px; margin: 0 auto;
            background: #0A0A0A; color: #F4F4F2;
            border: 1px solid rgba(255,255,255,0.14);
            border-bottom: none;
            border-radius: 20px 20px 0 0;
            padding: 18px 20px calc(22px + env(safe-area-inset-bottom));
            animation: sizepick-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .sizepick-head {
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; margin-bottom: 18px;
          }
          .sizepick-name { font-weight: 700; font-size: 0.95rem; letter-spacing: -0.01em; }
          .sizepick-sub {
            font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase;
            color: #8A8A86; margin-top: 4px; font-weight: 600;
          }
          .sizepick-close {
            width: 32px; height: 32px; border-radius: 50%;
            background: rgba(255,255,255,0.08); border: 0; color: #fff;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .sizepick-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 18px; }
          .sizepick-colors { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .sizepick-color {
            width: 38px; height: 38px; border-radius: 50%; padding: 0;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255,255,255,0.22); color: #F4F4F2;
            box-shadow: inset 0 0 0 1px rgba(0,0,0,0.18); cursor: pointer;
          }
          .sizepick-color.active { border-color: #F4F4F2; box-shadow: 0 0 0 2px #0A0A0A, 0 0 0 4px #F4F4F2; }
          .sizepick-section-title {
            font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase;
            color: #8A8A86; font-weight: 800; margin: 0 0 10px;
          }
          .sizepick-option {
            display: flex; flex-direction: column; align-items: flex-start; gap: 10px;
            padding: 16px; border-radius: 4px; cursor: pointer;
            border: 1px solid rgba(255,255,255,0.16);
            background: transparent; color: #F4F4F2;
            font-family: inherit; text-align: left;
            transition: background 0.18s ease, border-color 0.18s ease;
          }
          .sizepick-option.active { background: #F4F4F2; color: #0A0A0A; border-color: #F4F4F2; }
          .sizepick-option-name { font-size: 1rem; font-weight: 800; letter-spacing: 0.04em; }
          .sizepick-option-price { font-size: 0.8rem; font-weight: 600; opacity: 0.7; }
          .sizepick-confirm {
            width: 100%; padding: 15px 20px; border: 0; border-radius: 99px;
            background: #F4F4F2; color: #0A0A0A;
            font-family: inherit; font-size: 0.68rem; font-weight: 800;
            letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer;
            transition: background 0.2s ease;
          }
          .sizepick-confirm:hover { background: #fff; }
          @keyframes sizepick-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes sizepick-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @media (min-width: 640px) {
            .sizepick-sheet {
              bottom: auto; top: 50%; border-radius: 20px; border-bottom: 1px solid rgba(255,255,255,0.14);
              animation: sizepick-pop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            @keyframes sizepick-pop {
              from { opacity: 0; transform: translateY(-46%) scale(0.98); }
              to { opacity: 1; transform: translateY(-50%) scale(1); }
            }
          }
        `}</style>

        <div className="sizepick-head">
          <div>
            <div className="sizepick-name">{item.name}</div>
            <div className="sizepick-sub">Select size</div>
          </div>
          <button onClick={onClose} className="sizepick-close" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <p className="sizepick-section-title">Colour — {selectedColor}</p>
        <div className="sizepick-colors">
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`sizepick-color${selectedColor === color.name ? " active" : ""}`}
              style={{ background: color.hex }}
              onClick={() => setSelectedColor(color.name)}
              aria-label={color.name}
              title={color.name}
            />
          ))}
        </div>

        <p className="sizepick-section-title">Select size</p>
        <div className="sizepick-options">
          {sizes.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`sizepick-option${selected.name === s.name ? " active" : ""}`}
              onClick={() => setSelected(s)}
            >
              <span className="sizepick-option-name">{s.name}</span>
              <span className="sizepick-option-price">₹{s.price.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>

        <button type="button" className="sizepick-confirm" onClick={handleConfirm}>
          Add to bag · ₹{selected.price}
        </button>
      </div>
    </>,
    document.body
  );
}

const FoodCard = ({ item, cartItem, onAdd, onUpdateQuantity }: FoodCardProps) => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const optimizedImage = getOptimizedImageUrl(item.image, 600);
  const soldOut = !item.available && !item.isLaunchingSoon;

  const triggerAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isLaunchingSoon) {
      toast("Launching soon — preview only.", { icon: "✦" });
      return;
    }
    if (soldOut || !onAdd) return;
    if (getSizeOptions(item).length > 0) {
      setShowSizePicker(true);
    } else {
      onAdd(item);
      toast.success(`${item.name} added to bag`, { duration: 1200 });
    }
  };

  const go = () => router.push(`/item/${item.id}`);

  return (
    <>
      {showSizePicker && onAdd && (
        <SizePicker item={item} onClose={() => setShowSizePicker(false)} onAdd={onAdd} />
      )}

      <div
        className="pcard"
        onClick={go}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        }}
      >
        <div className="pcard-media">
          {!imgError ? (
            <>
              {!imgLoaded && (
                <div className="otw-img-skeleton" style={{ position: "absolute", inset: 0, zIndex: 1 }} />
              )}
              <Image
                src={optimizedImage}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{
                  objectFit: "cover",
                  opacity: (imgLoaded ? 1 : 0) * (soldOut ? 0.55 : 1),
                  transition: "opacity 0.3s ease-in-out",
                }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                color: "#9A9A96",
              }}
            >
              ✦
            </div>
          )}

          {item.isPopular && !item.isLaunchingSoon && !soldOut && (
            <span className="pcard-tag">Bestseller</span>
          )}
          {item.isLaunchingSoon && <span className="pcard-tag">Coming soon</span>}
          {soldOut && <span className="pcard-tag sold">Sold out</span>}

          <div className="pcard-action" onClick={(e) => e.stopPropagation()}>
            {cartItem && !item.isLaunchingSoon ? (
              <div className="pcard-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    onUpdateQuantity &&
                    onUpdateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity - 1)
                  }
                >
                  <Minus size={12} />
                </button>
                <span>{cartItem.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    onUpdateQuantity &&
                    onUpdateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity + 1)
                  }
                >
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="pcard-add"
                onClick={triggerAdd}
                disabled={soldOut}
                aria-label={soldOut ? "Sold out" : `Add ${item.name} to bag`}
              >
                {item.isLaunchingSoon ? "Soon" : soldOut ? "Sold out" : "Add"}
              </button>
            )}
          </div>
        </div>

        <div className="pcard-info">
          <div className="pcard-top-row">
            <span className="pcard-meta">
              {item.category}
              {item.brand ? ` · ${item.brand}` : ""}
            </span>
            <span className="pcard-swatches" aria-label={`Available colours: ${getColorOptions(item).map((c) => c.name).join(", ")}`}>
              {getColorOptions(item).map((color) => (
                <span
                  key={color.name}
                  className="pcard-swatch"
                  style={{ background: color.hex }}
                  title={color.name}
                />
              ))}
            </span>
          </div>
          <div className="pcard-name">{item.name}</div>
          <div className="pcard-price">
            <span>₹{item.price.toLocaleString("en-IN")}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <>
                <s>₹{item.originalPrice}</s>
                <span className="off">{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off</span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(FoodCard, (prev, next) => {
  return prev.item.id === next.item.id && prev.cartItem?.quantity === next.cartItem?.quantity;
});
