import React, { useState } from "react";
import { toast } from "sonner";
import { Modal, inputCls } from "./RoomUI";
import { CSV_COLUMNS } from "@/lib/booking/rooms.server";
import { FileDown } from "lucide-react";

export function CsvImportModal({
  onClose,
  onValidate,
  onConfirm,
}: {
  onClose: () => void;
  onValidate: (input: { data: { csv: string } }) => Promise<{
    total: number;
    valid: number;
    invalid: number;
    rows: { valid: boolean; errors: string[]; row: Record<string, string> }[];
  }>;
  onConfirm: (csv: string) => Promise<void>;
}) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof onValidate>> | null>(null);
  const [checking, setChecking] = useState(false);

  const template = CSV_COLUMNS.join(",");

  async function dryRun() {
    setChecking(true);
    try {
      const res = await onValidate({ data: { csv } });
      setResult(res);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setChecking(false);
  }

  return (
    <Modal onClose={onClose} title="Import Units (CSV)">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500">Columns: {template}</p>
          <button
            onClick={() => {
              const blob = new Blob([template + "\n"], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "bridges-units-template.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#2a382c] font-semibold"
          >
            <FileDown className="w-3.5 h-3.5" /> Download template
          </button>
        </div>
        <textarea
          rows={8}
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={`${template}\nCABIN-01,The Cedar Cabin,,,cabin,...`}
          className={inputCls + " font-mono text-xs"}
        />
        <div className="flex gap-2">
          <button
            onClick={dryRun}
            disabled={checking || !csv}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm disabled:opacity-60"
          >
            {checking ? "Validating…" : "Validate"}
          </button>
          <button
            onClick={() => onConfirm(csv)}
            disabled={!result || result.invalid > 0}
            className="px-4 py-2.5 rounded-xl bg-[#2a382c] text-white text-sm disabled:opacity-60"
          >
            Import {result?.valid ?? 0}
          </button>
        </div>
        {result && (
          <div className="text-xs space-y-1">
            <p className="text-stone-600">
              {result.valid} valid · {result.invalid} invalid
            </p>
            {result.rows
              .filter((r) => !r.valid)
              .map((r, i) => (
                <p key={i} className="text-rose-600">
                  {r.errors.join("; ")}
                </p>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
