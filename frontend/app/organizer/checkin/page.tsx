'use client';
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, Loader2, Camera, User, Mail, Calendar, Ticket, ArrowLeft, QrCode, List } from "lucide-react";

function CheckinScannerComponent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [mode, setMode] = useState<"scan" | "list">("scan");
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchAttendees();
    }
  }, [eventId]);

  const fetchAttendees = async () => {
    if (!eventId) return;
    setLoadingAttendees(true);
    try {
      const res = await fetch(`/api/bookings/events/${eventId}/bookings`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAttendees(data.data);
      }
    } catch {}
    setLoadingAttendees(false);
  };

  const fetchPreview = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkin-info`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Booking not found");
        return;
      }
      setPreview(data.data);
    } catch {
      setError("Failed to fetch booking info");
    }
  };

  const doCheckin = async () => {
    if (!lastScannedRef.current) return;
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/bookings/${lastScannedRef.current}/checkin`, {
        method: 'PUT', credentials: 'include',
      });
      const data = await res.json();
      setResult(data.success
        ? { success: true, message: "Checked in successfully!" }
        : { success: false, message: data.error || "Check-in failed" }
      );
      if (data.success) {
        fetchAttendees();
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    }
    setCheckingIn(false);
    setPreview(null);
  };

  useEffect(() => {
    if (mode !== "scan") return;

    let mounted = true;
    let scanner: Html5Qrcode | null = null;

    const startCamera = async (facingMode: "environment" | "user" = "environment") => {
      // Small delay to let the DOM element render
      await new Promise(r => setTimeout(r, 50));
      if (!mounted) return;

      const qrReader = document.getElementById("qr-reader");
      if (!qrReader) return;

      scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode },
          { fps: 15, qrbox: { width: 280, height: 280 } },
          async (decodedText) => {
            if (scanner) {
              try { await scanner.stop(); } catch {}
            }
            scanner = null;
            scannerRef.current = null;
            setScanning(false);
            lastScannedRef.current = decodedText;
            await fetchPreview(decodedText);
          },
          () => {}
        );

        // After await: check if cleanup already ran
        if (!mounted) {
          try { await scanner.stop(); } catch {}
          scanner = null;
          scannerRef.current = null;
          return;
        }
      } catch {
        scanner = null;
        scannerRef.current = null;
        if (!mounted) return;
        if (facingMode === "environment") {
          await startCamera("user");
        } else {
          setError("Camera not available. Use manual input below.");
          setScanning(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (scanner) {
        try { scanner.stop(); } catch {}
        scanner = null;
      }
      scannerRef.current = null;
    };
  }, [mode]);

  const handleManualLookup = async () => {
    if (!manualId.trim()) return;
    lastScannedRef.current = manualId.trim();
    setScanning(false);
    await fetchPreview(manualId.trim());
    setManualId("");
  };

  const resetScanner = () => {
    setResult(null);
    setError("");
    setPreview(null);
    lastScannedRef.current = null;
    // Toggle mode to re-trigger the camera useEffect
    setMode("list");
    requestAnimationFrame(() => {
      setScanning(true);
      setMode("scan");
    });
  };

  const checkedInCount = attendees.filter((a: any) => a.checkedIn).length;

  return (
    <div className="min-h-screen p-6 pt-24 max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent">
          Check In
        </h1>
        {eventId && (
          <button
            onClick={() => setMode(mode === "scan" ? "list" : "scan")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {mode === "scan" ? <List className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
            {mode === "scan" ? "List" : "Scan"}
          </button>
        )}
      </div>

      {eventId && (
        <div className="glass-card py-3 px-5 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Checked in</span>
          <span className="font-semibold">{checkedInCount} / {attendees.length}</span>
        </div>
      )}

      {mode === "list" && eventId ? (
        <div className="space-y-3">
          {loadingAttendees ? (
            <div className="glass-card p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : attendees.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No bookings yet</p>
            </div>
          ) : (
            attendees.map((booking: any) => (
              <div key={booking._id} className={`glass-card p-4 flex items-center gap-3 ${booking.checkedIn ? 'opacity-60' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${booking.checkedIn ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-foreground'}`}>
                  {booking.userId?.firstName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.userId?.firstName} {booking.userId?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{booking.quantity} ticket(s) {booking.checkedIn && "— Checked in"}</p>
                </div>
                {!booking.checkedIn && (
                  <button
                    onClick={async () => {
                      lastScannedRef.current = booking._id;
                      await fetchPreview(booking._id);
                    }}
                    className="premium-button text-xs py-1.5 px-3"
                  >
                    Check In
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : result ? (
        <div className={`glass-card p-8 text-center ${result.success ? 'text-green-400' : 'text-red-400'}`}>
          {result.success ? <CheckCircle className="w-12 h-12 mx-auto" /> : <XCircle className="w-12 h-12 mx-auto" />}
          <p className="mt-4 text-lg font-medium">{result.message}</p>
          <button onClick={resetScanner} className="premium-button mt-6 py-3 px-8">
            Scan Next
          </button>
        </div>
      ) : preview ? (
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-center">Confirm Check-In</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <User className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Attendee</p>
                <p className="font-medium">{preview.user?.firstName} {preview.user?.lastName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{preview.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Event</p>
                <p className="font-medium">{preview.event?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <Ticket className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium">{preview.quantity} ticket(s)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={resetScanner} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button
              onClick={doCheckin}
              disabled={checkingIn}
              className="flex-1 premium-button text-sm py-2.5 disabled:opacity-50"
            >
              {checkingIn ? "Checking in..." : "Confirm Check-In"}
            </button>
          </div>
        </div>
      ) : scanning ? (
        <div className="glass-card p-6">
          <div id="qr-reader" className="w-full max-w-sm mx-auto [&_video]:rounded-xl" />
          <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            Point camera at the attendee&apos;s QR code
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 text-center space-y-4">
          {error ? (
            <div className="text-red-400 text-sm flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Starting camera...</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-muted-foreground mb-2">Or enter booking ID manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="Paste booking ID"
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:ring-1 focus:ring-primary/50 outline-none"
              />
              <button
                onClick={handleManualLookup}
                disabled={!manualId.trim()}
                className="premium-button text-sm py-2 px-4 disabled:opacity-50"
              >
                Look Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckinScanner() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6 pt-24 max-w-lg mx-auto flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading check-in scanner...</p>
        </div>
      </div>
    }>
      <CheckinScannerComponent />
    </Suspense>
  );
}
