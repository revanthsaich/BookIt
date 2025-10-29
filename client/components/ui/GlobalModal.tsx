import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import type { ModalPayload } from "@/lib/modal";

export default function GlobalModal() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<ModalPayload | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onShow = (e: Event) => {
      const ev = e as CustomEvent<ModalPayload>;
      setPayload(ev.detail ?? null);
      setOpen(true);
      if (ev.detail?.autoHideMs) {
        setTimeout(() => {
          setOpen(false);
        }, ev.detail.autoHideMs);
      }
    };
    const onHide = () => {
      setOpen(false);
    };
    window.addEventListener("bookit:show-modal", onShow as EventListener);
    window.addEventListener("bookit:hide-modal", onHide as EventListener);
    return () => {
      window.removeEventListener("bookit:show-modal", onShow as EventListener);
      window.removeEventListener("bookit:hide-modal", onHide as EventListener);
    };
  }, []);

  if (!open || !payload) return null;

  const handlePrimary = () => {
    setOpen(false);
    if (payload.primaryHref) {
      navigate(payload.primaryHref);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative pointer-events-auto bg-white rounded-lg shadow-lg p-6 flex flex-col items-center gap-4 w-[90%] max-w-sm mx-4 z-10">
        <button className="absolute right-3 top-3 text-muted-foreground" onClick={() => setOpen(false)} aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
          <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {payload.title && <div className="font-semibold">{payload.title}</div>}
        {payload.message && <div className="text-sm text-center text-muted-foreground">{payload.message}</div>}
        <div className="flex gap-2 w-full mt-2">
          {payload.primaryText ? (
            <button onClick={handlePrimary} className="flex-1 bg-primary text-white py-2 rounded">
              {payload.primaryText}
            </button>
          ) : null}
          <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 py-2 rounded">
            {payload.secondaryText ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
