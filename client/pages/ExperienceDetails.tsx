import Layout from "@/components/Layout";
import { apiFetch } from "../lib/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { addToCart } from "../lib/cart";
import { showModal } from "@/lib/modal";

interface Slot {
  slotId: string;
  date: string;
  time: string;
  capacity: number;
  booked: number;
  available: number;
}

interface ExperienceDetail {
  id: string;
  title: string;
  description: string;
  pricePerPerson: number;
  currency: string;
  images: string[];
  duration: string;
  location: string;
  rating: number;
  reviews: number;
  slots: Slot[];
}

export default function ExperienceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const normalizeDate = (d: string) => {
    if (!d) return d;
    const parts = String(d).split(/T|\s/);
    const datePart = parts[0];
    if (/^\d{4}-\d{2}-\d{2}/.test(datePart)) return datePart.slice(0, 10);
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return datePart;
    }
  };

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
  const response = await apiFetch(`/api/experiences/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch experience details");
        }
  const data = await response.json();
  // server returns { data: { ... } }
  setExperience(data?.data ?? data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExperience();
    }
  }, [id]);

  const nextImage = () => {
    if (experience) {
      setImageIndex((prev) => (prev + 1) % experience.images.length);
    }
  };

  const prevImage = () => {
    if (experience) {
      setImageIndex(
        (prev) => (prev - 1 + experience.images.length) % experience.images.length
      );
    }
  };

  const handleBookNow = () => {
    if (selectedSlot) {
      navigate(`/checkout?experienceId=${experience?.id}&slotId=${selectedSlot}`);
    }
  };

  const [adding, setAdding] = useState(false);
  const handleAddToCart = () => {
    if (!selectedSlot || !experience) {
      showModal({ title: "Select a slot", message: "Please select a slot before adding to cart.", secondaryText: "OK" });
      return;
    }
    setAdding(true);
    const res = addToCart({
      experienceId: experience.id,
      slotId: selectedSlot,
      title: experience.title,
      pricePerPerson: experience.pricePerPerson,
    });
    setAdding(false);
    if (!res.ok) {
      showModal({ title: "Could not add", message: res.message || "Could not add to cart", secondaryText: "OK" });
      return;
    }
    // Show a centered success modal with View Cart button
    showModal({ title: "Added to cart", message: "The item was added to your cart.", primaryText: "View Cart", primaryHref: "/checkout", secondaryText: "Continue", autoHideMs: 3000 });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !experience) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Experiences
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "Experience not found"}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image + Details */}
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden">
              <img
                src={experience.images[imageIndex]}
                alt={experience.title}
                className="w-full h-[380px] object-cover"
              />
            </div>

            <div className="mt-6">
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
                {experience.title}
              </h1>
              <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Choose Date */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Choose date
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(experience.slots.map((s) => normalizeDate(s.date)))].map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm border ${
                      selectedDate === date
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "border-gray-200 hover:bg-gray-100 text-muted-foreground"
                    }`}
                  >
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Time */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Choose time
              </h3>
              <div className="flex flex-wrap gap-2">
                {(selectedDate ? experience.slots.filter(s => normalizeDate(s.date) === selectedDate) : experience.slots).map((slot) => {
                  const isDisabled = (slot.available ?? (slot.capacity - (slot.booked ?? 0))) <= 0;
                  const slotsLeft = slot.available ?? Math.max(0, (slot.capacity ?? 0) - (slot.booked ?? 0));
                  return (
                    <button
                      key={slot.slotId}
                      onClick={() => !isDisabled && setSelectedSlot(slot.slotId)}
                      disabled={isDisabled}
                      className={`px-4 py-1.5 rounded-full text-sm border transition ${
                        selectedSlot === slot.slotId
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : isDisabled
                          ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
                          : "border-gray-200 hover:bg-gray-100 text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{slot.time}</span>
                        {!isDisabled ? (
                          <span className="ml-1 text-xs text-gray-600">{slotsLeft} left</span>
                        ) : (
                          <span className="ml-1 text-xs text-red-500">Sold out</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                All times are in IST (GMT +5:30)
              </p>
            </div>

            {/* About */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                About
              </h3>
              <p className="text-xs bg-gray-50 text-muted-foreground rounded-lg px-3 py-2">
                Scenic routes, trained guides, and safety briefing. Minimum age 10.
              </p>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
            <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Starts at</span>
                <span className="text-foreground font-medium">
                  ₹{experience.pricePerPerson}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Quantity</span>
                <div className="flex items-center gap-3">
                  <button className="border rounded px-2 py-0.5 text-sm">−</button>
                  <span>1</span>
                  <button className="border rounded px-2 py-0.5 text-sm">+</button>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{experience.pricePerPerson}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxes</span>
                <span>₹59</span>
              </div>
            </div>

            <div className="flex justify-between text-base font-semibold text-foreground mb-4">
              <span>Total</span>
              <span>₹{experience.pricePerPerson + 59}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!selectedSlot}
              className="w-full bg-gray-200 text-foreground rounded-md py-2.5 font-medium disabled:opacity-60"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
