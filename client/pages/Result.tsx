import Layout from "@/components/Layout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type BookingView = {
  _id: string;
  experienceId?: string;
  slotId?: string;
  name?: string;
  email?: string;
  quantity?: number;
  totalAmount?: number;
  promoCode?: string | null;
  experience?: any | null;
  slot?: any | null;
};

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "success";
  const isSuccess = status === "success";
  const idsParam = searchParams.get("ids") || "";
  const bookingIds = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingIds.length) return;
      setLoading(true);
      try {
        const results = await Promise.all(bookingIds.map(async (id) => {
          const res = await apiFetch(`/api/bookings/${id}`);
          if (!res.ok) return null;
          const payload = await res.json().catch(() => null);
          return payload?.data ?? null;
        }));
        const valid = results.filter(Boolean) as BookingView[];
        setBookings(valid);
      } catch (err) {
        console.error(err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idsParam]);

  const totalAmount = bookings.reduce((s, b) => s + (Number(b.totalAmount) || 0), 0);
  // Fallback to total from query string if booking fetch didn't return details
  const totalParam = Number(searchParams.get("total") || "");
  const displayTotal = bookings.length ? totalAmount : (isFinite(totalParam) && totalParam > 0 ? totalParam : totalAmount);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
          {isSuccess ? (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-success" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Booking Confirmed!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your experience booking has been confirmed. A confirmation email has been sent to your inbox.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-lg font-semibold text-foreground mb-4">Booking Details</h2>
                <div className="space-y-3">
                  {bookingIds.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID(s)</span>
                      <span className="font-medium text-foreground">{bookingIds.map((id) => `BK#${id.slice(0,8)}`).join(", ")}</span>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex justify-center py-6"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>
                  ) : error ? (
                    <div className="text-sm text-red-600">{error}</div>
                  ) : (
                    bookings.map((b) => (
                      <div key={b._id} className="p-3 bg-white rounded border">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{b.experience?.title ?? b.experienceId}</div>
                            <div className="text-xs text-muted-foreground">{b.slot ? `${new Date(b.slot.date).toLocaleDateString()} · ${b.slot.time}` : b.slotId}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Qty: {b.quantity ?? 1}</div>
                            <div className="text-sm text-muted-foreground">{b.promoCode ? `Promo: ${b.promoCode}` : ""}</div>
                            <div className="font-bold mt-2">₹{(Number(b.totalAmount) || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="font-bold text-foreground">₹{displayTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-20 h-20 text-danger" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Booking Failed</h1>
              <p className="text-lg text-muted-foreground mb-8">Unfortunately, your booking could not be completed. Please try again or contact our support team.</p>
            </>
          )}

          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate("/")} className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Back to Home</button>
            {isSuccess && (
              <button onClick={() => navigate("/")} className="bg-gray-200 hover:bg-gray-300 text-foreground px-8 py-3 rounded-lg font-semibold transition-colors">Browse More Experiences</button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
