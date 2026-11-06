// Tiny notification helper: toast("Copied"), toast.success("Saved"), toast.error(err).
// Replaces the browser's blocking alert() popups. Rendered by <Toaster /> in the root layout.

export type ToastKind = "success" | "error" | "info";
export type ToastDetail = { kind: ToastKind; message: string };
export const TOAST_EVENT = "optinova:toast";

function emit(kind: ToastKind, message: unknown, fallback: string) {
  if (typeof window === "undefined") return;
  const text = typeof message === "string" ? message : message instanceof Error ? message.message : "";
  window.dispatchEvent(
    new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { kind, message: (text || fallback).trim() } })
  );
}

export const toast = Object.assign((message: unknown) => emit("info", message, "Done"), {
  success: (message: unknown) => emit("success", message, "Done"),
  error: (message: unknown) => emit("error", message, "Something went wrong. Please try again."),
});
