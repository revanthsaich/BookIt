import Layout from "@/components/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getCart, removeFromCart, updateQuantity, clearCart, CartItem } from "../lib/cart";
import { showModal } from "@/lib/modal";
import { X } from "lucide-react";

type ItemDetail = { item: CartItem; experience: any | null; slot: any | null };

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [itemsDetails, setItemsDetails] = useState<ItemDetail[]>([]);
  const [bookingTime, setBookingTime] = useState<Date | null>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; amount: number } | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);

  // If the page is loaded with a single experience/slot query (legacy), add it to the cart view
  useEffect(() => {
    const experienceId = searchParams.get("experienceId");
    const slotId = searchParams.get("slotId");
    if (experienceId && slotId) {
      // ensure cart state reflects storage
      setCart(getCart());
      // we will also try to fetch the single item below if present
    }
  }, [searchParams]);

  // Load details for every cart item
  useEffect(() => {
    const loadDetails = async () => {
      const current = getCart();
      setCart(current);
      if (!current.length) {
        setItemsDetails([]);
        return;
      }
      setLoading(true);
      try {
        const promises = current.map(async (it) => {
          const res = await apiFetch(`/api/experiences/${it.experienceId}`);
          const payload = res.ok ? await res.json() : null;
          const exp = payload?.data ?? payload ?? null;
          const slot = exp?.slots?.find((s: any) => s.slotId === it.slotId) ?? null;
          return { item: it, experience: exp, slot } as ItemDetail;
        });
        const results = await Promise.all(promises);
        setItemsDetails(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [cart.length]);

  const handleRemove = (experienceId: string, slotId: string) => {
    removeFromCart(experienceId, slotId);
    const current = getCart();
    setCart(current);
    setItemsDetails((prev) => prev.filter((p) => !(p.item.experienceId === experienceId && p.item.slotId === slotId)));
  };

  const handleQty = (experienceId: string, slotId: string, qty: number) => {
    updateQuantity(experienceId, slotId, qty);
    const current = getCart();
    setCart(current);
    setItemsDetails((prev) => prev.map((p) => (p.item.experienceId === experienceId && p.item.slotId === slotId ? { ...p, item: { ...p.item, quantity: qty } } : p)));
  };

  const subtotal = itemsDetails.reduce((sum, row) => {
    const price = Number(row.item.pricePerPerson ?? row.experience?.pricePerPerson ?? 0);
    const qty = Number(row.item.quantity ?? 1);
    return sum + price * qty;
  }, 0);

  const total = subtotal; // promo/fees can be applied later
  const totalAfterPromo = (() => {
    if (!appliedPromo) return subtotal;
    if (appliedPromo.type === "percent") {
      return Math.max(0, subtotal * (1 - appliedPromo.amount / 100));
    }
    // flat
    return Math.max(0, subtotal - (appliedPromo.amount || 0));
  })();
  const TAX_RATE = 0.18; // 18% GST-like tax (apply after discount)
  const discountAmount = appliedPromo
    ? appliedPromo.type === "percent"
      ? subtotal * (appliedPromo.amount / 100)
      : Math.min(subtotal, appliedPromo.amount)
    : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxes = Math.round((taxableAmount * TAX_RATE) * 100) / 100;
  const finalTotal = Math.round((taxableAmount + taxes) * 100) / 100;

  const handleBooking = async (e?: any) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return showModal({ title: "Missing info", message: "Please enter your name and email.", secondaryText: "OK" });
    }
    if (!agree) {
      return showModal({ title: "Agree to terms", message: "Please agree to the terms and safety policy.", secondaryText: "OK" });
    }
    if (!itemsDetails.length) {
      return showModal({ title: "Empty cart", message: "Your cart is empty.", secondaryText: "OK" });
    }

    setLoading(true);
    try {
      // Create bookings for each cart item
      const results = await Promise.all(itemsDetails.map(async (row) => {
        const qty = Number(row.item.quantity ?? 1);
        const price = Number(row.item.pricePerPerson ?? row.experience?.pricePerPerson ?? 0);
        const totalAmount = price * qty;
        const body = {
          experienceId: row.item.experienceId,
          slotId: row.item.slotId,
          name,
          email,
          quantity: qty,
          totalAmount,
          promoCode: appliedPromo?.code ?? null,
        };
        const res = await apiFetch("/api/bookings", { method: "POST", body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
      }));

      const failed = results.filter((r) => !r.ok);
      if (failed.length) {
        const first = failed[0];
        const msg = first.data?.error || `Booking failed (status ${first.status})`;
        showModal({ title: "Booking failed", message: msg, secondaryText: "OK" });
        setLoading(false);
        return;
      }

      // all succeeded
  const bookingIds = results.map((r: any) => r.data?.data?._id || r.data?.data?.id || null).filter(Boolean);
      const now = new Date();
      setBookingTime(now);
      clearCart();
      setCart([]);
      setItemsDetails([]);
  // Pass total as a convenience so Result can show a total even if booking details fail to load
  navigate(`/result?status=success&ids=${encodeURIComponent(bookingIds.join(","))}&total=${encodeURIComponent(finalTotal.toFixed(2))}`);
    } catch (err) {
      console.error(err);
      showModal({ title: "Error", message: "Failed to create booking. Please try again.", secondaryText: "OK" });
    } finally {
      setLoading(false);
    }
  };

    return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Checkout</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: form section */}
          <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 space-y-4">
            {/* Full name and email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              />
            </div>

            {/* Selected items list */}
            {itemsDetails.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Your selections</h3>
                <div className="space-y-3">
                  {itemsDetails.map((row) => (
                    <div key={`${row.item.experienceId}-${row.item.slotId}`} className="flex items-center justify-between bg-white border border-gray-100 rounded-md p-3">
                      <div className="flex items-start gap-3">
                        <div className="text-sm">
                          <div className="font-medium text-foreground">{row.experience?.title || row.item.title || 'Experience'}</div>
                          <div className="text-xs text-muted-foreground">{row.slot ? new Date(row.slot.date).toLocaleDateString() : ''} {row.slot ? `· ${row.slot.time}` : ''}</div>
                          <div className="text-xs text-gray-500">₹{(row.item.pricePerPerson ?? row.experience?.pricePerPerson ?? 0).toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQty(row.item.experienceId, row.item.slotId, (row.item.quantity ?? 1) - 1)} className="border rounded px-2 py-0.5 text-sm">−</button>
                          <span className="text-sm">{row.item.quantity ?? 1}</span>
                          <button onClick={() => handleQty(row.item.experienceId, row.item.slotId, (row.item.quantity ?? 1) + 1)} className="border rounded px-2 py-0.5 text-sm">+</button>
                        </div>
                        <button onClick={() => handleRemove(row.item.experienceId, row.item.slotId)} className="text-xs text-red-500">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo code */}
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo code"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 text-sm"
              />
              <button
                onClick={async () => {
                  if (!promoCode.trim())
                    return showModal({
                      title: "Enter code",
                      message: "Please enter a promo code.",
                      secondaryText: "OK",
                    });
                  setPromoLoading(true);
                  try {
                    const res = await apiFetch("/api/promo/validate", {
                      method: "POST",
                      body: JSON.stringify({ code: promoCode }),
                    });
                    if (!res.ok) {
                      const body = await res.json().catch(() => ({}));
                      setAppliedPromo(null);
                      showModal({
                        title: "Invalid code",
                        message: body?.error || "Promo not valid",
                        secondaryText: "OK",
                      });
                    } else {
                      const data = await res.json();
                      if (!data?.valid) {
                        setAppliedPromo(null);
                        showModal({
                          title: "Invalid code",
                          message: "Promo not valid",
                          secondaryText: "OK",
                        });
                      } else {
                        const p = data.promo;
                        setAppliedPromo(p);
                        showModal({
                          title: "Promo applied",
                          message: `Code ${p.code} applied`,
                          secondaryText: "OK",
                          autoHideMs: 2000,
                        });
                      }
                    }
                  } catch (e) {
                    console.error(e);
                    showModal({
                      title: "Error",
                      message: "Failed to validate promo",
                      secondaryText: "OK",
                    });
                  } finally {
                    setPromoLoading(false);
                  }
                }}
                disabled={promoLoading}
                className="px-5 py-2.5 bg-black text-white rounded-md text-sm font-medium disabled:opacity-60"
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 border-gray-300" />
              <span className="text-sm text-gray-600">I agree to the terms and safety policy</span>
            </div>
          </div>

          {/* Right: summary card */}
          <div className="bg-gray-50 rounded-xl p-6 h-fit">
            <div className="space-y-3 border-b border-gray-200 pb-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Experience</span>
                <span className="font-medium">
                  {itemsDetails[0]?.experience?.title || "Kayaking"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Date</span>
                <span>
                  {itemsDetails[0]?.slot
                    ? new Date(itemsDetails[0].slot.date).toLocaleDateString()
                    : "2025-10-22"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Time</span>
                <span>{itemsDetails[0]?.slot?.time || "09:00 am"}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Qty</span>
                <span>{itemsDetails[0]?.item?.quantity || 1}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      <div className="text-sm font-medium">Promo ({appliedPromo.code})</div>
                      <div className="text-xs text-muted-foreground">{appliedPromo.type === 'percent' ? `${appliedPromo.amount}% off` : `₹${appliedPromo.amount} off`}</div>
                    </div>
                    <div className="text-sm font-medium">-₹{discountAmount.toFixed(2)} <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="ml-2 text-xs text-primary">Remove</button></div>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes ({Math.round(TAX_RATE*100)}%)</span>
                  <span className="font-medium">₹{taxes.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Final Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex justify-between items-center text-lg font-semibold text-gray-800 mt-4">
              <span>Total</span>
              <span>₹{(subtotal + 59).toFixed(0)}</span>
            </div>

            <button
              onClick={handleBooking}
              className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-md font-medium transition"
            >
              Pay and Confirm
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

}
