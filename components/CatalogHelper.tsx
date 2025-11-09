'use client';

import { ChangeEvent, useMemo, useState } from "react";
import { exportToCsv, marketplaceProfiles, parseCatalogSheet } from "../lib/catalogProcessing";
import type { CatalogOutputRow, MarketplaceKey } from "../lib/types";

interface CatalogHelperProps {
  rawData: string;
  marketplace: MarketplaceKey;
  onRawDataChange: (value: string) => void;
  onMarketplaceChange: (value: MarketplaceKey) => void;
  generatedRows: CatalogOutputRow[];
  onGenerate: () => void;
}

const sampleInput = `Aurora Performance Tee | AUR-TEE-01 | 799 | Activewear | 120 | Quick dry fabric with reflective strip | sports;running;fitness
Nebula Luxe Saree | NBL-SAE-23 | 1499 | Ethnic Wear | 80 | Soft silk blend with zari border | festive;wedding;traditional
Lumos Night Lamp | LUM-LMP-09 | 1299 | Home Decor | 60 | Rechargeable, 3 brightness modes | lighting;home;gift`;

export default function CatalogHelper({
  rawData,
  marketplace,
  generatedRows,
  onMarketplaceChange,
  onRawDataChange,
  onGenerate
}: CatalogHelperProps) {
  const [templateInfo, setTemplateInfo] = useState<string | null>(null);

  const profile = marketplaceProfiles[marketplace];
  const previewRows = useMemo(() => generatedRows.slice(0, 5), [generatedRows]);

  const handleTemplateUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseCatalogSheet(text);
      if (!parsed) {
        setTemplateInfo("Could not parse template. Ensure it's a clean CSV.");
        return;
      }
      setTemplateInfo(
        `Detected ${parsed.rows.length} rows with headers: ${parsed.headers.join(", ")}`
      );
    };
    reader.readAsText(file);
  };

  const downloadCsv = () => {
    if (!generatedRows.length) return;
    const csv = exportToCsv(generatedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${marketplace}-catalog-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Marketplace Catalog Architect</h2>
          <p className="text-sm text-slate-400">
            Paste raw product intel and let Aurora shape channel-ready listings.
          </p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(marketplaceProfiles) as MarketplaceKey[]).map((key) => (
            <button
              key={key}
              onClick={() => onMarketplaceChange(key)}
              className={`rounded-full border px-4 py-2 text-sm capitalize ${
                marketplace === key
                  ? "border-brand bg-brand/20 text-brand"
                  : "border-slate-700 text-slate-300 hover:border-brand hover:text-brand"
              }`}
              type="button"
            >
              {marketplaceProfiles[key].name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-slate-300">
            Raw catalog intel{" "}
            <button
              type="button"
              className="text-xs underline decoration-dotted decoration-brand"
              onClick={() => onRawDataChange(sampleInput)}
            >
              load sample
            </button>
          </label>
          <textarea
            value={rawData}
            onChange={(event) => onRawDataChange(event.target.value)}
            placeholder={sampleInput}
            className="min-h-[220px] rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
          <button
            onClick={onGenerate}
            type="button"
            className="rounded-2xl bg-gradient-to-r from-brand to-brand-dark px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Generate optimized catalog
          </button>
          <div>
            <label className="text-sm text-slate-400">Reference marketplace template</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleTemplateUpload}
              className="mt-2 block w-full text-xs text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-brand/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/30"
            />
            {templateInfo && (
              <p className="mt-2 text-xs text-amber-300">{templateInfo}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
            <h3 className="text-lg font-semibold text-slate-100">
              {profile.name} optimization blueprint
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-400">
              <li>
                • Title limit: <span className="text-slate-200">{profile.titleMaxLength} chars</span>
              </li>
              <li>• {profile.descriptionTemplate}</li>
              <li>• Keyword strategy: {profile.keywordHint}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h3 className="text-lg font-semibold text-slate-100">Preview</h3>
            {previewRows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Once you generate, the first few listings will preview here with export options.
              </p>
            ) : (
              <div className="mt-3 space-y-3 text-xs text-slate-300">
                {previewRows.map((row) => (
                  <div
                    key={`${row.sku}-${row.platform}`}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-100">{row.title}</p>
                      <span className="rounded-full bg-brand/10 px-2 py-1 text-[10px] uppercase tracking-wide text-brand">
                        {row.platform}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-400">{row.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.keywords.slice(0, 6).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={downloadCsv}
            disabled={!generatedRows.length}
            className="rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download CSV export
          </button>
        </div>
      </div>
    </div>
  );
}
