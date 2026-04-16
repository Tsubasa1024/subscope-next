"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";

interface Props {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  loading?: boolean;
}

async function getCroppedImg(imageSrc: string, croppedAreaPixels: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    400,
    400,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      0.9,
    );
  });
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel, loading = false }: Props) {
  const [crop, setCrop]   = useState({ x: 0, y: 0 });
  const [zoom, setZoom]   = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedArea) return;
    const blob = await getCroppedImg(imageSrc, croppedArea);
    onConfirm(blob);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#1c1c1e", borderRadius: 20,
        width: "100%", maxWidth: 400,
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        {/* title */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #2c2c2e" }}>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#f5f5f7", textAlign: "center", margin: 0 }}>
            プロフィール画像を切り取る
          </p>
        </div>

        {/* crop area */}
        <div style={{ position: "relative", width: "100%", height: 320, background: "#000" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* zoom slider */}
        <div style={{ padding: "16px 24px 8px", display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#0a84ff", cursor: "pointer" }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>

        {/* buttons */}
        <div style={{ display: "flex", gap: 12, padding: "12px 20px 20px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "none",
              background: "#2c2c2e", color: "#f5f5f7", fontSize: "0.95rem",
              fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !croppedArea}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "none",
              background: "#0a84ff", color: "#fff", fontSize: "0.95rem",
              fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.7s linear infinite",
                }} />
                アップロード中
              </>
            ) : "適用する"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
