import "server-only";

import type { CommerceProduct, CommerceShop, WorldEntity, WorldPosition } from "@/lib/types";

const SHOP_COLORS = ["#05e7ff", "#8dffb3", "#ffbf5f", "#7bc8ff", "#ff8aa6"];
const DEFAULT_POLICY = {
  budget: 120,
  approvalThreshold: 75,
  verifiedOnly: true,
} as const;

type ShopifyCollectionNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  image?: { url?: string | null } | null;
  products: {
    nodes: ShopifyProductNode[];
  };
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  vendor?: string | null;
  availableForSale: boolean;
  onlineStoreUrl?: string | null;
  featuredImage?: { url?: string | null } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    nodes: Array<{ id: string }>;
  };
};

const FALLBACK_SHOPS: CommerceShop[] = [
  {
    id: "shop-demo-orbit",
    slug: "orbit-supply",
    label: "Orbit Supply",
    description: "Verified gadget and workspace gear curated for fast-moving operators.",
    verified: true,
    source: "demo",
    color: "#05e7ff",
    position: { x: 180, y: 250 },
    products: [
      {
        id: "prod-orbit-keyboard",
        shopId: "shop-demo-orbit",
        title: "Orbit Mechanical Keyboard",
        handle: "orbit-mechanical-keyboard",
        description: "Low-profile mechanical keyboard built for focused command center work.",
        vendor: "Orbit Supply",
        price: 64,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-orbit-keyboard",
      },
      {
        id: "prod-orbit-dock",
        shopId: "shop-demo-orbit",
        title: "Orbit USB-C Dock",
        handle: "orbit-usb-c-dock",
        description: "Compact dock for multi-monitor, high-throughput workstation setups.",
        vendor: "Orbit Supply",
        price: 48,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-orbit-dock",
      },
    ],
  },
  {
    id: "shop-demo-nova",
    slug: "nova-studio",
    label: "Nova Studio",
    description: "Design-forward accessories and creator essentials from a verified vendor.",
    verified: true,
    source: "demo",
    color: "#8dffb3",
    position: { x: 450, y: 170 },
    products: [
      {
        id: "prod-nova-headphones",
        shopId: "shop-demo-nova",
        title: "Nova Monitoring Headphones",
        handle: "nova-monitoring-headphones",
        description: "Closed-back studio headphones with balanced monitoring response.",
        vendor: "Nova Studio",
        price: 96,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-nova-headphones",
      },
      {
        id: "prod-nova-mic",
        shopId: "shop-demo-nova",
        title: "Nova USB Mic",
        handle: "nova-usb-mic",
        description: "Plug-and-play microphone tuned for streaming, calls, and demos.",
        vendor: "Nova Studio",
        price: 72,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-nova-mic",
      },
    ],
  },
  {
    id: "shop-demo-apex",
    slug: "apex-labs",
    label: "Apex Labs",
    description: "Performance gear and devices for builders who like their setups fast.",
    verified: true,
    source: "demo",
    color: "#ffbf5f",
    position: { x: 720, y: 300 },
    products: [
      {
        id: "prod-apex-mouse",
        shopId: "shop-demo-apex",
        title: "Apex Precision Mouse",
        handle: "apex-precision-mouse",
        description: "Lightweight wireless mouse with programmable macros and low latency.",
        vendor: "Apex Labs",
        price: 52,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-apex-mouse",
      },
      {
        id: "prod-apex-lightbar",
        shopId: "shop-demo-apex",
        title: "Apex Monitor Light Bar",
        handle: "apex-monitor-light-bar",
        description: "Soft bias lighting built to keep long sessions easy on the eyes.",
        vendor: "Apex Labs",
        price: 39,
        currencyCode: "USD",
        availableForSale: true,
        image:
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80",
        variantId: "gid://shopify/ProductVariant/demo-apex-lightbar",
      },
    ],
  },
];

type CatalogSource = "shopify" | "demo";

type WorldCatalog = {
  source: CatalogSource;
  shops: CommerceShop[];
  worldEntities: WorldEntity[];
  policy: typeof DEFAULT_POLICY;
};

const COLLECTIONS_QUERY = `
  query WorldCollections($first: Int!, $productsFirst: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
        }
        products(first: $productsFirst) {
          nodes {
            id
            handle
            title
            description
            vendor
            availableForSale
            onlineStoreUrl
            featuredImage {
              url
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              nodes {
                id
              }
            }
          }
        }
      }
    }
  }
`;

function getPresetPosition(index: number): WorldPosition {
  const presets: WorldPosition[] = [
    { x: 180, y: 250 },
    { x: 450, y: 170 },
    { x: 720, y: 300 },
    { x: 280, y: 460 },
    { x: 610, y: 470 },
  ];

  return presets[index % presets.length];
}

function buildCartUrl(storeDomain: string, variantId?: string) {
  if (!variantId) return undefined;

  const shortVariantId = variantId.split("/").pop();
  if (!shortVariantId) return undefined;

  return `https://${storeDomain}/cart/${shortVariantId}:1`;
}

function normalizeShopifyShop(
  collection: ShopifyCollectionNode,
  index: number,
  storeDomain: string,
): CommerceShop {
  const color = SHOP_COLORS[index % SHOP_COLORS.length];
  const shopId = `shopify-${collection.handle}`;
  const products = collection.products.nodes.map<CommerceProduct>((product) => ({
    id: product.id,
    shopId,
    title: product.title,
    handle: product.handle,
    description: product.description ?? "No description provided by the merchant.",
    vendor: product.vendor ?? collection.title,
    price: Number(product.priceRange.minVariantPrice.amount),
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    availableForSale: product.availableForSale,
    image: product.featuredImage?.url ?? undefined,
    variantId: product.variants.nodes[0]?.id,
    checkoutUrl: buildCartUrl(storeDomain, product.variants.nodes[0]?.id) ?? product.onlineStoreUrl ?? undefined,
  }));

  return {
    id: shopId,
    slug: collection.handle,
    label: collection.title,
    description: collection.description ?? "Shopify-backed shop imported into the commerce district.",
    verified: true,
    source: "shopify",
    color,
    position: getPresetPosition(index),
    image: collection.image?.url ?? undefined,
    products,
  };
}

export function buildWorldEntities(shops: CommerceShop[]): WorldEntity[] {
  const shopEntities = shops.map<WorldEntity>((shop) => ({
    id: shop.id,
    type: "shop",
    label: shop.label,
    description: shop.description,
    position: shop.position,
    verified: shop.verified,
    accentColor: shop.color,
    shopId: shop.id,
    metadata: {
      productCount: shop.products.length,
      verified: shop.verified,
    },
  }));

  const staticEntities: WorldEntity[] = [
    {
      id: "mission-terminal",
      type: "mission",
      label: "Compare Terminal",
      description: "Launch a best-deal mission and let the agent evaluate the district.",
      position: { x: 470, y: 355 },
      accentColor: "#05e7ff",
    },
    {
      id: "approval-vault",
      type: "approval_point",
      label: "Approval Vault",
      description: "High-confidence actions route here when step-up authorization is needed.",
      position: { x: 770, y: 135 },
      accentColor: "#ffbf5f",
    },
    {
      id: "activity-beacon",
      type: "activity_feed",
      label: "Activity Beacon",
      description: "Inspect the agent decision trail, execution messages, and outcomes.",
      position: { x: 205, y: 120 },
      accentColor: "#8dffb3",
    },
  ];

  return [...shopEntities, ...staticEntities];
}

async function fetchShopifyCatalog(): Promise<CommerceShop[]> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!storeDomain || !storefrontToken) {
    throw new Error("Missing Shopify storefront configuration.");
  }

  const response = await fetch(`https://${storeDomain}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({
      query: COLLECTIONS_QUERY,
      variables: {
        first: 5,
        productsFirst: 6,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: { collections?: { nodes?: ShopifyCollectionNode[] } };
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  const collections = payload.data?.collections?.nodes ?? [];
  const normalized = collections
    .filter((collection) => collection.products.nodes.length > 0)
    .map((collection, index) => normalizeShopifyShop(collection, index, storeDomain));

  if (!normalized.length) {
    throw new Error("No Shopify collections with products were returned.");
  }

  return normalized;
}

export async function getWorldCatalog(): Promise<WorldCatalog> {
  try {
    const shops = await fetchShopifyCatalog();
    return {
      source: "shopify",
      shops,
      worldEntities: buildWorldEntities(shops),
      policy: DEFAULT_POLICY,
    };
  } catch {
    return {
      source: "demo",
      shops: FALLBACK_SHOPS,
      worldEntities: buildWorldEntities(FALLBACK_SHOPS),
      policy: DEFAULT_POLICY,
    };
  }
}
