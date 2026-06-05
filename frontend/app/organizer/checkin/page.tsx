'use client';
import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, Loader2, Camera, User, Mail, Calendar, Ticket } from "lucide-react";

export default function CheckinScanner() {
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const lastScannedRef = useRef<string | null>(null);

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
    } catch {
      setResult({ success: false, message: "Network error" });
    }
    setCheckingIn(false);
    setPreview(null);
  };

  const startCamera = async (facingMode: "environment" | "user" = "environment") => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode },
        { fps: 15, qrbox: { width: 280, height: 280 } },
        async (decodedText) => {
          runningRef.current = false;
          await scanner.stop().catch(() => {});
          setScanning(false);
          lastScannedRef.current = decodedText;
          await fetchPreview(decodedText);
        },
        () => {}
      );
      runningRef.current = true;
    } catch {
      if (facingMode === "environment") {
        await startCamera("user");
      } else {
        setError("Camera not available. Use manual input below.");
        setScanning(false);
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (runningRef.current) {
        scannerRef.current?.stop().catch(() => {});
      }
    };
  }, []);

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
    setScanning(true);
    setPreview(null);
    lastScannedRef.current = null;
    requestAnimationFrame(() => startCamera());
  };

  return (
    <div className="min-h-screen p-6 pt-24 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent text-center">
        Check In
      </h1>

      {result ? (
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
