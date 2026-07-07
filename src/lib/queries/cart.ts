import { storefrontFetch } from "@/lib/shopify";

// ─── Checkout-URL helper ─────────────────────────────────────────────────────

/**
 * Shopify's checkoutUrl uses the store's primary domain (www.jnknutrition.com),
 * which now points to this headless Next.js app instead of Shopify's checkout
 * servers. We rewrite the host to the myshopify domain so the browser navigates
 * directly to Shopify's checkout infrastructure on the first hop.
 *
 * Shopify will still redirect back to the primary domain once (to set session
 * cookies), at which point our custom not-found page catches the request and
 * shows a branded checkout-unavailable message. The long-term fix is to add a
 * dedicated checkout subdomain (e.g. checkout.jnknutrition.com) in Shopify
 * Admin → Settings → Domains, with a CNAME pointing to Shopify's servers.
 */
function rewriteCheckoutUrl(cart: Cart): Cart {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!storeDomain || !cart.checkoutUrl) return cart;
  try {
    const url = new URL(cart.checkoutUrl);
    url.hostname = storeDomain;
    return { ...cart, checkoutUrl: url.toString() };
  } catch {
    return cart;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type MoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type CartLineImage = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type CartLineMerchandise = {
  id: string;
  title: string;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: { name: string; value: string }[];
  product: {
    id: string;
    title: string;
    handle: string;
    images: { edges: { node: CartLineImage }[] };
  };
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: MoneyV2;
    amountPerQuantity: MoneyV2;
  };
  merchandise: CartLineMerchandise;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount: MoneyV2 | null;
  };
  lines: { edges: { node: CartLine }[] };
};

export type CartUserError = {
  field: string[] | null;
  message: string;
};

// ─── Fragment ────────────────────────────────────────────────────────────────

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount { amount currencyCode }
            amountPerQuantity { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
              product {
                id title handle
                images(first: 1) { edges { node { url altText width height } } }
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Mutations & Queries ──────────────────────────────────────────────────────

const CART_CREATE = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
`;

const GET_CART = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFragment }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function createCart(): Promise<Cart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: Cart; userErrors: CartUserError[] };
  }>(CART_CREATE, { input: {} });
  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return rewriteCheckoutUrl(data.cartCreate.cart);
}

export async function addCartLine(
  cartId: string,
  merchandiseId: string,
  quantity: number
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: Cart; userErrors: CartUserError[] };
  }>(CART_LINES_ADD, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });
  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  return rewriteCheckoutUrl(data.cartLinesAdd.cart);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: Cart; userErrors: CartUserError[] };
  }>(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }
  return rewriteCheckoutUrl(data.cartLinesUpdate.cart);
}

export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: Cart; userErrors: CartUserError[] };
  }>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] });
  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }
  return rewriteCheckoutUrl(data.cartLinesRemove.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontFetch<{ cart: Cart | null }>(GET_CART, {
    cartId,
  });
  return data.cart ? rewriteCheckoutUrl(data.cart) : null;
}
