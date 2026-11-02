import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };

export interface SignaturePadHandle {
  clear: () => void;
  /** PNG de la signature (fond transparent, 900 px de large), ou null si le cadre est vide. */
  toDataURL: () => string | null;
}

const HEIGHT = 200;
const EXPORT_WIDTH = 900;
const INK = "#211f1b";
/** En dessous de cette longueur de tracé (px), on considère que ce n'est pas une signature. */
const MIN_INK_LENGTH = 40;

function inkLength(strokes: Point[][]) {
  let total = 0;
  for (const s of strokes) for (let i = 1; i < s.length; i++) total += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
  return total;
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Point[], scale: number) {
  if (stroke.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(stroke[0].x * scale, stroke[0].y * scale);
  if (stroke.length === 1) {
    ctx.lineTo(stroke[0].x * scale + 0.1, stroke[0].y * scale + 0.1);
  } else {
    // Courbe lissée par les milieux des segments.
    for (let i = 1; i < stroke.length - 1; i++) {
      const mx = (stroke[i].x + stroke[i + 1].x) / 2;
      const my = (stroke[i].y + stroke[i + 1].y) / 2;
      ctx.quadraticCurveTo(stroke[i].x * scale, stroke[i].y * scale, mx * scale, my * scale);
    }
    const last = stroke[stroke.length - 1];
    ctx.lineTo(last.x * scale, last.y * scale);
  }
  ctx.stroke();
}

/** Cadre de signature au doigt (tactile) ou à la souris. */
const SignaturePad = forwardRef<SignaturePadHandle, { onChange: (hasSignature: boolean) => void; invalid?: boolean; describedBy?: string }>(
  function SignaturePad({ onChange, invalid, describedBy }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokes = useRef<Point[][]>([]);
    const drawing = useRef(false);
    const widthRef = useRef(0);

    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4 * dpr;
      for (const s of strokes.current) drawStroke(ctx, s, dpr);
    }, []);

    // Taille du canvas = taille affichée × densité de l'écran ; le tracé est gardé en
    // coordonnées CSS pour survivre à une rotation du téléphone.
    useEffect(() => {
      const wrap = wrapRef.current;
      const canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const resize = () => {
        const width = wrap.clientWidth;
        if (!width || width === widthRef.current) return;
        const previous = widthRef.current;
        widthRef.current = width;
        if (previous) {
          const k = width / previous;
          strokes.current = strokes.current.map((s) => s.map((p) => ({ x: p.x * k, y: p.y })));
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(HEIGHT * dpr);
        redraw();
      };
      resize();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(resize);
      observer.observe(wrap);
      return () => observer.disconnect();
    }, [redraw]);

    const point = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const notify = () => onChange(inkLength(strokes.current) >= MIN_INK_LENGTH);

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drawing.current = true;
      strokes.current.push([point(e)]);
      redraw();
    };
    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      e.preventDefault();
      strokes.current[strokes.current.length - 1].push(point(e));
      redraw();
    };
    const end = () => {
      if (!drawing.current) return;
      drawing.current = false;
      notify();
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        strokes.current = [];
        redraw();
        onChange(false);
      },
      toDataURL: () => {
        if (inkLength(strokes.current) < MIN_INK_LENGTH || !widthRef.current) return null;
        const scale = EXPORT_WIDTH / widthRef.current;
        const out = document.createElement("canvas");
        out.width = EXPORT_WIDTH;
        out.height = Math.round(HEIGHT * scale);
        const ctx = out.getContext("2d");
        if (!ctx) return null;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.4 * scale;
        for (const s of strokes.current) drawStroke(ctx, s, scale);
        return out.toDataURL("image/png");
      },
    }), [onChange, redraw]);

    return (
      <div ref={wrapRef} className={cn("relative overflow-hidden rounded-md border-2 border-dashed bg-white", invalid ? "border-destructive" : "border-[hsl(20_35%_78%)]")}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Zone de signature : signez avec votre doigt ou la souris"
          aria-describedby={describedBy}
          className="block w-full cursor-crosshair touch-none select-none"
          style={{ height: HEIGHT }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-10 border-b border-[hsl(30_15%_85%)]" />
      </div>
    );
  },
);

export default SignaturePad;
