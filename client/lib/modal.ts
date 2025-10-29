export type ModalPayload = {
  title?: string;
  message?: string;
  primaryText?: string;
  primaryHref?: string; // navigate to this route when primary clicked
  secondaryText?: string;
  autoHideMs?: number | null; // if provided, auto close after ms
};

export function showModal(payload: ModalPayload) {
  try {
    window.dispatchEvent(new CustomEvent("bookit:show-modal", { detail: payload }));
  } catch (e) {
    console.warn("Failed to dispatch modal event", e);
  }
}

export function hideModal() {
  try {
    window.dispatchEvent(new CustomEvent("bookit:hide-modal"));
  } catch {}
}

export default { showModal, hideModal };
