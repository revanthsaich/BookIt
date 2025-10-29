import { useEffect, useMemo, useState } from "react";
import { getCart, removeFromCart, updateQuantity, CartItem } from "../lib/cart";
import { ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => getCart());
  const navigate = useNavigate();

  useEffect(() => {
    const onUpdate = () => setItems(getCart());
    // custom event
    window.addEventListener("bookit:cart-updated", onUpdate as EventListener);
    // storage event (other tabs)
    const onStorage = () => setItems(getCart());
    window.addEventListener("storage", onStorage as EventListener);
    return () => {
      window.removeEventListener("bookit:cart-updated", onUpdate as EventListener);
      window.removeEventListener("storage", onStorage as EventListener);
    };
  }, []);

  const count = useMemo(() => items.reduce((s, it) => s + (it.quantity ?? 1), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + (Number(it.pricePerPerson ?? 0) * (it.quantity ?? 1)), 0), [items]);

  const handleRemove = (it: CartItem) => {
    removeFromCart(it.experienceId, it.slotId);
    setItems(getCart());
  };

  const handleQty = (it: CartItem, qty: number) => {
    updateQuantity(it.experienceId, it.slotId, qty);
    setItems(getCart());
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="sr-only">Cart</span>
        <span className="text-sm hidden sm:inline">Cart</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-medium">Your Cart</div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground"><X /></button>
          </div>

          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">Your cart is empty</div>
            ) : (
              items.map((it) => (
                <div key={`${it.experienceId}::${it.slotId}`} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{it.title ?? it.experienceId}</div>
                    <div className="text-xs text-muted-foreground">Slot: {it.slotId}</div>
                    <div className="text-xs text-muted-foreground">${(it.pricePerPerson ?? 0).toFixed(2)} each</div>
                    <div className="mt-2 flex items-center gap-2">
                      <input type="number" min={1} value={it.quantity ?? 1} onChange={(e) => handleQty(it, Math.max(1, Number(e.target.value || 1)))} className="w-16 px-2 py-1 border rounded" />
                      <button onClick={() => handleRemove(it)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Subtotal</div>
              <div className="font-medium">${subtotal.toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setOpen(false); navigate('/checkout'); }} className="flex-1 bg-primary text-white px-3 py-2 rounded">Checkout</button>
              <button onClick={() => { setOpen(false); }} className="flex-1 border rounded px-3 py-2">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
