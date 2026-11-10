import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, X } from "lucide-react";

export type BookingActivity = "bowling" | "shuffleboard" | "dart";

export const BOOKING_BASE_URL = "https://boka.kimsoftbookings.se/markaryds-bowlinghall";

export const BOOKING_URLS: Record<BookingActivity, string> = {
  bowling: `${BOOKING_BASE_URL}/bowling`,
  shuffleboard: `${BOOKING_BASE_URL}/shuffleboard`,
  dart: `${BOOKING_BASE_URL}/dart`,
};

const TITLES: Record<BookingActivity, string> = {
  bowling: "Boka bowling",
  shuffleboard: "Boka shuffleboard",
  dart: "Boka dart",
};

type Ctx = {
  openBooking: (activity: BookingActivity) => void;
  /** Props for an <a>: keeps the real href, opens the dialog on a plain click. */
  bookingLinkProps: (activity: BookingActivity) => {
    href: string;
    target: string;
    rel: string;
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  };
};

const BookingDialogContext = createContext<Ctx | null>(null);

export const useBookingDialog = () => {
  const ctx = useContext(BookingDialogContext);
  if (!ctx) throw new Error("useBookingDialog must be used within BookingDialogProvider");
  return ctx;
};

export const BookingDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [activity, setActivity] = useState<BookingActivity | null>(null);
  const [open, setOpen] = useState(false);

  const openBooking = useCallback((a: BookingActivity) => {
    setActivity(a);
    setOpen(true);
  }, []);

  const bookingLinkProps = useCallback(
    (a: BookingActivity) => ({
      href: BOOKING_URLS[a],
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openBooking(a);
      },
    }),
    [openBooking]
  );

  return (
    <BookingDialogContext.Provider value={{ openBooking, bookingLinkProps }}>
      {children}
      <BookingDialog activity={activity} open={open} onOpenChange={setOpen} />
    </BookingDialogContext.Provider>
  );
};

const BookingDialog = ({
  activity,
  open,
  onOpenChange,
}: {
  activity: BookingActivity | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoaded(false);
    setSlow(false);
    const t = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(t);
  }, [open, activity]);

  if (!activity) return null;
  const url = BOOKING_URLS[activity];
  const title = TITLES[activity];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-0 top-0 z-50 flex flex-col bg-background shadow-elegant w-[100dvw] h-[100dvh] rounded-none p-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[calc(100vw-2rem)] md:max-w-5xl md:h-[90vh] md:rounded-xl md:overflow-hidden md:border-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div
            className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-primary/20 bg-card px-4 py-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <DialogTitle className="text-xl md:text-2xl font-bold text-card-foreground flex-1 truncate">
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">Bokningsfönster för {title.toLowerCase()}</DialogDescription>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 underline font-medium whitespace-nowrap"
            >
              Öppna i ny flik
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <DialogPrimitive.Close
              className="rounded-md p-2 text-foreground hover:bg-muted hover:text-primary transition-colors"
              aria-label="Stäng"
            >
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>

          <div
            className="relative flex-1 min-h-0 overflow-auto"
            style={{ WebkitOverflowScrolling: "touch", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {open && (
              <iframe
                key={url}
                src={url}
                title={title}
                allow="payment"
                className="w-full h-full border-0 block"
                onLoad={() => setLoaded(true)}
              />
            )}
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Laddar bokningen…</p>
                {slow && (
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">Laddas inte bokningen?</p>
                    <Button variant="bowling" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Öppna bokningen i ny flik
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default BookingDialog;
