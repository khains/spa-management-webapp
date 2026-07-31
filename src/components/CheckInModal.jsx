import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { appointmentApi } from "../api/appointmentApi";
import { Modal, ErrorBanner } from "./Common";
import { displayNameOf, formatDateTime, appointmentStatusLabel } from "../utils/format";

export default function CheckInModal({ onClose, onCheckedIn }) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  async function submitCode(code) {
    if (!code) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const appt = await appointmentApi.checkInByCode(code.trim());
      setResult(appt);
      stopScanning();
      onCheckedIn?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data) {
      submitCode(code.data);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function startScanning() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraError("Không truy cập được camera. Hãy cho phép quyền camera hoặc nhập mã thủ công bên dưới.");
    }
  }

  function stopScanning() {
    setScanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => stopScanning, []);

  return (
    <Modal title="Check-in bằng mã" onClose={() => { stopScanning(); onClose(); }} width={480}>
      {!scanning && (
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={startScanning}>
          Mở camera quét mã QR
        </button>
      )}

      {scanning && (
        <div style={{ marginBottom: 14 }}>
          <video ref={videoRef} style={{ width: "100%", borderRadius: 12 }} muted playsInline />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button className="btn btn-secondary" style={{ width: "100%", marginTop: 8 }} onClick={stopScanning}>
            Dừng quét
          </button>
        </div>
      )}

      {cameraError && (
        <div style={{ margin: "10px 0" }}>
          <ErrorBanner message={cameraError} />
        </div>
      )}

      <div className="divider" />

      <div className="field">
        <label>Hoặc nhập mã check-in thủ công</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" value={manualCode} onChange={(e) => setManualCode(e.target.value)} />
          <button className="btn btn-primary" onClick={() => submitCode(manualCode)} disabled={loading || !manualCode}>
            {loading ? "..." : "Check-in"}
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {result && (
        <div className="card" style={{ marginTop: 14, background: "var(--color-sage-soft)", borderColor: "var(--color-sage)" }}>
          <strong>Check-in thành công!</strong>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>Khách: {displayNameOf(result.customer)}</div>
          <div style={{ fontSize: 13.5 }}>Giờ hẹn: {formatDateTime(result.startTime)}</div>
          <div style={{ fontSize: 13.5 }}>Trạng thái: {appointmentStatusLabel(result.status)}</div>
        </div>
      )}
    </Modal>
  );
}
