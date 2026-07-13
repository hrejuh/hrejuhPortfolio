import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ToolShell } from "./shared";

export function QrMakerTool() {
  const [value, setValue] = useState("https://hrejuh.com");
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!canvas.current || !value.trim()) return;
      const { toCanvas } = await import("qrcode");
      await toCanvas(canvas.current, value.trim(), { width: 640, margin: 3, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } });
      canvas.current.style.width = "100%";
      canvas.current.style.height = "auto";
    }, 120);
    return () => clearTimeout(timer);
  }, [value]);

  const download = () => {
    if (!canvas.current || !value.trim()) return toast.error("Enter something first.");
    const link = document.createElement("a"); link.download = "qr-code.png"; link.href = canvas.current.toDataURL("image/png"); link.click();
  };

  return <ToolShell title="QR Maker" subtitle="Turn any link or text into a clean QR code. Everything stays in your browser.">
    <div className="grid min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-elevated/30 md:grid-cols-[1fr_1.05fr]">
      <div className="min-w-0 border-b border-border p-6 md:border-b-0 md:border-r md:p-8">
        <label className="editorial-caption mb-3 block" htmlFor="qr-value">Text or link</label>
        <textarea id="qr-value" value={value} onChange={(event) => setValue(event.target.value)} rows={8} placeholder="Paste a URL, message, phone number…" className="w-full resize-none rounded-xl border border-border bg-background p-4 leading-6 outline-none focus:ring-1 focus:ring-accent"/>
        <button onClick={download} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary p-3 font-medium text-primary-foreground"><Download size={17}/> Download PNG</button>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">For payments or important details, scan the result once before sharing.</p>
      </div>
      <div className="flex min-h-80 min-w-0 items-center justify-center bg-white p-6 sm:p-8"><div className="w-full max-w-72"><canvas ref={canvas} className="block h-auto w-full"/></div></div>
    </div>
  </ToolShell>;
}
