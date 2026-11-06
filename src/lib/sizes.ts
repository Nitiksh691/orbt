import type { MenuItem } from "./types";

export type SizeOption = {
  name: string;
  price: number;
};

const DEFAULT_SIZE_NAMES = ["S", "M", "L", "XL"];

const UNSIZED_HINTS = [
  "accessor",
  "bag",
  "footwear",
  "shoe",
  "sock",
  "cap",
  "hat",
  "jewel",
  "belt",
  "scarf",
];

export function getSizeOptions(item: MenuItem): SizeOption[] {
  if (Array.isArray(item.sizes) && item.sizes.length > 0) {
    return item.sizes;
  }

  if (item.hasTallSize) {
    return [
      { name: "M", price: item.price },
      { name: "L", price: item.price + 20 },
    ];
  }

  const category = (item.category || "").toLowerCase();
  if (UNSIZED_HINTS.some((hint) => category.includes(hint))) {
    return [];
  }

  return DEFAULT_SIZE_NAMES.map((name) => ({ name, price: item.price }));
}

export function getDefaultSize(item: MenuItem): SizeOption | null {
  return getSizeOptions(item)[0] ?? null;
}

export type ColorOption = {
  name: string;
  hex: string;
};

const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  white: "#F4F4F2",
  charcoal: "#2B2B2B",
  grey: "#8A8A86",
  gray: "#8A8A86",
  beige: "#C9B8A3",
  cream: "#E8D9B8",
  sand: "#D8C3A5",
  brown: "#5A3A28",
  olive: "#555B37",
  blue: "#2C4A6B",
  navy: "#16243B",
  red: "#8F2323",
  pink: "#D9A7B0",
  yellow: "#D7B633",
};

export function getColorOptions(item: MenuItem): ColorOption[] {
  const values: string[] = [];

  if (Array.isArray(item.tags)) {
    values.push(...item.tags);
  }

  if (Array.isArray(item.badges)) {
    values.push(...item.badges);
  }

  if (Array.isArray(item.customizationCategories)) {
    for (const category of item.customizationCategories) {
      const name = category.name.toLowerCase();
      if (name.includes("colour") || name.includes("color") || name.includes("shade")) {
        values.push(...category.options.map((option) => option.name));
      }
    }
  }

  const matched = (item.description || "").match(/(black|white|charcoal|grey|gray|beige|cream|sand|brown|olive|blue|navy|red|pink|yellow)/gi);
  if (matched) {
    values.push(...matched);
  }

  const byName = new Map<string, ColorOption>();
  for (const value of values) {
    const name = value.trim();
    const key = name.toLowerCase();
    if (!name || byName.has(key)) continue;
    const hex = COLOR_HEX[key] ?? (name.startsWith("#") ? name : "#555555");
    byName.set(key, { name: name === "gray" ? "Grey" : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), hex });
    if (byName.size >= 4) break;
  }

  if (byName.size === 0) {
    return [{ name: "Essential Black", hex: "#111111" }];
  }

  return Array.from(byName.values());
}
