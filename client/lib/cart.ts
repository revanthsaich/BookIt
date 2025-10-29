export interface CartItem {
  experienceId: string;
  slotId: string;
  title?: string;
  pricePerPerson?: number;
  quantity?: number; // default 1
}

const KEY = "bookit_cart_v1";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  try {
    // emit a DOM event so UI can react to cart changes
    window.dispatchEvent(new CustomEvent("bookit:cart-updated", { detail: { count: items.length } }));
  } catch {}
}

export function addToCart(item: CartItem): { ok: boolean; message?: string } {
  const items = getCart();
  const exists = items.find((i) => i.experienceId === item.experienceId && i.slotId === item.slotId);
  if (exists) return { ok: false, message: "Item already in cart" };
  items.push({ ...item, quantity: item.quantity ?? 1 });
  saveCart(items);
  return { ok: true };
}

export function removeFromCart(experienceId: string, slotId: string) {
  const items = getCart();
  const filtered = items.filter((i) => !(i.experienceId === experienceId && i.slotId === slotId));
  saveCart(filtered);
}

export function clearCart() {
  saveCart([]);
}

export function updateQuantity(experienceId: string, slotId: string, qty: number) {
  const items = getCart();
  const idx = items.findIndex((i) => i.experienceId === experienceId && i.slotId === slotId);
  if (idx === -1) return;
  items[idx].quantity = Math.max(1, Math.floor(qty));
  saveCart(items);
}
