import { FileDown, Files, RotateCw, Scissors } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TabBar, ToolShell } from "./shared";

type Mode = "merge" | "extract" | "rotate";

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "merge", label: "Merge" },
  { id: "extract", label: "Extract pages" },
  { id: "rotate", label: "Rotate" },
];

function download(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function parsePages(value: string, pageCount: number) {
  const pages = new Set<number>();
  for (const part of value.split(",").map((item) => item.trim()).filter(Boolean)) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) throw new Error(`Invalid page selection: ${part}`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) throw new Error(`Pages must be between 1 and ${pageCount}.`);
    for (let page = start; page <= end; page++) pages.add(page - 1);
  }
  if (!pages.size) throw new Error("Enter at least one page.");
  return [...pages];
}

export function PdfToolkit() {
  const [mode, setMode] = useState<Mode>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [selection, setSelection] = useState("1-3");
  const [rotation, setRotation] = useState(90);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!files.length) return toast.error("Choose a PDF first.");
    setBusy(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      if (mode === "merge") {
        if (files.length < 2) throw new Error("Choose at least two PDFs to merge.");
        const output = await PDFDocument.create();
        for (const file of files) {
          const source = await PDFDocument.load(await file.arrayBuffer());
          const pages = await output.copyPages(source, source.getPageIndices());
          pages.forEach((page) => output.addPage(page));
        }
        download(await output.save(), "merged.pdf");
      } else {
        const source = await PDFDocument.load(await files[0]!.arrayBuffer());
        if (mode === "extract") {
          const output = await PDFDocument.create();
          const pages = await output.copyPages(source, parsePages(selection, source.getPageCount()));
          pages.forEach((page) => output.addPage(page));
          download(await output.save(), "extracted-pages.pdf");
        } else {
          source.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + rotation) % 360)));
          download(await source.save(), "rotated.pdf");
        }
      }
      toast.success("Your PDF is ready.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process that PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="PDF Toolkit"
      subtitle="Merge, extract, and rotate PDFs privately. Files stay in your browser and are never uploaded."
    >
      <TabBar tabs={MODES} active={mode} onChange={(next) => { setMode(next); setFiles([]); }} />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated/40">
        <label className="group flex min-h-56 cursor-pointer flex-col items-center justify-center border-b border-dashed border-border px-6 py-10 text-center hover:bg-accent/5">
          <Files size={34} className="mb-4 text-accent transition-transform group-hover:-rotate-3 group-hover:scale-110" />
          <span className="font-display text-xl font-bold">Choose {mode === "merge" ? "PDFs" : "a PDF"}</span>
          <span className="mt-2 text-sm text-muted-foreground">{mode === "merge" ? "Select files in the order you want them combined" : "PDF files only"}</span>
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            multiple={mode === "merge"}
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>

        <div className="p-5 md:p-7">
          {files.length > 0 && (
            <ol className="mb-6 space-y-2 text-sm">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="truncate"><span className="mr-2 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>{file.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </li>
              ))}
            </ol>
          )}

          {mode === "extract" && (
            <label className="mb-6 block">
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Pages</span>
              <input value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="1-3, 6, 9-12" className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-accent" />
            </label>
          )}

          {mode === "rotate" && (
            <div className="mb-6 grid grid-cols-3 gap-2">
              {[90, 180, 270].map((angle) => (
                <button key={angle} type="button" onClick={() => setRotation(angle)} className={`rounded-lg border px-3 py-3 font-mono text-sm ${rotation === angle ? "border-accent bg-accent/10" : "border-border"}`}>{angle}°</button>
              ))}
            </div>
          )}

          <button type="button" disabled={busy || !files.length} onClick={run} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-40">
            {mode === "merge" ? <Files size={18} /> : mode === "extract" ? <Scissors size={18} /> : <RotateCw size={18} />}
            {busy ? "Working…" : mode === "merge" ? "Merge and download" : mode === "extract" ? "Extract and download" : "Rotate and download"}
            {!busy && <FileDown size={16} />}
          </button>
        </div>
      </div>
    </ToolShell>
  );
}
