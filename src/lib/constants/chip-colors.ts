export interface ChipColorPair {
  bg: string;
  text: string;
}

export interface ChipFamily {
  id: string;
  name: string;
  hexPreview: string;
  light: ChipColorPair; // Contexts
  medium: ChipColorPair; // Categories
}

export const CHIP_FAMILIES: ChipFamily[] = [
  {
    id: "coral",
    name: "Coral",
    hexPreview: "#F0997B",
    light: { bg: "#F5C4B3", text: "#4A1B0C" },
    medium: { bg: "#F0997B", text: "#4A1B0C" },
  },
  {
    id: "teal",
    name: "Teal",
    hexPreview: "#5DCAA5",
    light: { bg: "#9FE1CB", text: "#04342C" },
    medium: { bg: "#5DCAA5", text: "#04342C" },
  },
  {
    id: "pink",
    name: "Pink",
    hexPreview: "#ED93B1",
    light: { bg: "#F4C0D1", text: "#4B1528" },
    medium: { bg: "#ED93B1", text: "#4B1528" },
  },
  {
    id: "purple",
    name: "Roxo",
    hexPreview: "#AFA9EC",
    light: { bg: "#CECBF6", text: "#26215C" },
    medium: { bg: "#AFA9EC", text: "#26215C" },
  },
  {
    id: "amber",
    name: "Âmbar",
    hexPreview: "#EF9F27",
    light: { bg: "#FAC775", text: "#412402" },
    medium: { bg: "#EF9F27", text: "#412402" },
  },
  {
    id: "gray",
    name: "Gray",
    hexPreview: "#B4B2A9",
    light: { bg: "#D3D1C7", text: "#2C2C2A" },
    medium: { bg: "#B4B2A9", text: "#2C2C2A" },
  },
  {
    id: "blue",
    name: "Azul",
    hexPreview: "#85B7EB",
    light: { bg: "#B5D4F4", text: "#042C53" },
    medium: { bg: "#85B7EB", text: "#042C53" },
  },
  {
    id: "green",
    name: "Verde",
    hexPreview: "#97C459",
    light: { bg: "#C0DD97", text: "#173404" },
    medium: { bg: "#97C459", text: "#173404" },
  },
];

/**
  Given a hex or color string stored in database, return appropriate chip styles
  type: 'context' (uses light bg) or 'category' (uses medium bg)
 */
export function getChipStyle(
  colorInput: string | undefined | null,
  type: "context" | "category"
): { backgroundColor: string; color: string; borderColor: string } {
  if (!colorInput) {
    const fallback = CHIP_FAMILIES[0];
    const pair = type === "context" ? fallback.light : fallback.medium;
    return { backgroundColor: pair.bg, color: pair.text, borderColor: pair.bg };
  }

  // Check if input matches one of our 8 family IDs or preview/bg hex
  const family = CHIP_FAMILIES.find(
    (f) =>
      f.id === colorInput.toLowerCase() ||
      f.hexPreview.toLowerCase() === colorInput.toLowerCase() ||
      f.light.bg.toLowerCase() === colorInput.toLowerCase() ||
      f.medium.bg.toLowerCase() === colorInput.toLowerCase()
  );

  if (family) {
    const pair = type === "context" ? family.light : family.medium;
    return {
      backgroundColor: pair.bg,
      color: pair.text,
      borderColor: pair.bg,
    };
  }

  // Custom hex fallback
  return {
    backgroundColor: colorInput,
    color: "#2C2C2A",
    borderColor: "#D3D1C7",
  };
}
