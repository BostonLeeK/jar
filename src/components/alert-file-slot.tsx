import { Label } from "@/components/ui";
import { UploadBar } from "@/components/upload-bar";

export function AlertFileSlot({
  label,
  accept,
  preview,
  hint,
  disabled,
  progress,
  onFile,
  onClear,
}: {
  label: string;
  accept: string;
  preview?: string | null;
  hint: string;
  disabled?: boolean;
  progress?: number | null;
  onFile: (file: File) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {preview ? <img src={preview} alt="" className="h-10 w-10 rounded-lg object-cover" /> : null}
        <label className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600 hover:bg-zinc-50">
          {progress != null ? `${progress}%` : hint}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onFile(file);
              }
            }}
          />
        </label>
        {onClear ? (
          <button type="button" onClick={onClear} className="text-xs text-zinc-400 hover:text-red-600">
            ×
          </button>
        ) : null}
      </div>
      {progress != null ? <div className="mt-2"><UploadBar value={progress} /></div> : null}
    </div>
  );
}
