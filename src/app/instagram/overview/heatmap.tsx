"use client";

import { fmtCompact } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({ grid, max }: { grid: number[][]; max: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-[2px] text-[10px] text-prism-text-muted">
        <thead>
          <tr>
            <th className="w-8" />
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} className="text-center font-normal">{h % 3 === 0 ? h : ""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, dow) => (
            <tr key={dow}>
              <td className="pr-2 text-right">{DAYS[dow]}</td>
              {row.map((v, h) => {
                const ratio = max ? v / max : 0;
                const bg = `hsla(271, 91%, 65%, ${0.06 + ratio * 0.65})`;
                return (
                  <td key={h} title={`${DAYS[dow]} ${h}:00 — ${fmtCompact(v)} avg`} className="rounded">
                    <div className="aspect-square w-full rounded-[4px]" style={{ background: bg }} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
