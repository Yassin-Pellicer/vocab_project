import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type SketchboardProps = {
  storageKey: string;
  heightClass?: string;
};

export default function Sketchboard({
  storageKey,
  heightClass = "h-24",
}: SketchboardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<"draw" | "erase">("draw");

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const applyStrokeStyle = (currentMode: "draw" | "erase") => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.lineWidth = currentMode === "erase" ? 10 : 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const styles = getComputedStyle(document.documentElement);
    ctx.strokeStyle =
      (styles.getPropertyValue("--color-foreground") || "#111827").trim();
  };

  const saveSketch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      localStorage.setItem(storageKey, dataUrl);
    } catch {
    }
  };

  const resizeCanvas = () => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const prevData = canvas.toDataURL("image/png");
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    applyStrokeStyle(mode);

    if (prevData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = prevData;
    }
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(wrap);
    resizeCanvas();

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const ctx = canvas.getContext("2d");
      const rect = wrap.getBoundingClientRect();
      if (ctx && rect.width && rect.height) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = saved;
      }
    }

    return () => observer.disconnect();
  }, [storageKey]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    if (!point) return;
    drawingRef.current = true;
    lastPointRef.current = point;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const point = getCanvasPoint(event);
    const last = lastPointRef.current;
    if (!ctx || !point || !last) return;
    ctx.globalCompositeOperation =
      mode === "erase" ? "destination-out" : "source-over";
    applyStrokeStyle(mode);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(event.pointerId);
    }
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearSketch = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="flex flex-col rounded-lg items-center border border-dashed border-border/70 bg-background/40 p-3 overflow-hidden">
      <div className="flex w-full justify-between gap-2">
        <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Sketchboard
        </p>
        <p className="text-xs mt-1 text-muted-foreground">Tired of Learning? Try sketching something!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "draw" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("draw")}
          >
            Draw
          </Button>
          <Button
            variant={mode === "erase" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("erase")}
          >
            Erase
          </Button>
          <Button variant="outline" size="sm" onClick={saveSketch}>
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSketch}>
            Clear
          </Button>
        </div>
      </div>
      <div
        ref={wrapRef}
        className={`mt-2 h-50 w-125 rounded-md border border-border/60 bg-muted/20 ${heightClass}`}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full rounded-md"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  );
}
