import { useEffect, useRef, useState } from "react";
import { Check, Upload, X } from "lucide-react";
import {
  uploadViaPresign,
  validateFile,
  type UploadType,
  type UploadValidationError,
} from "@/services/uploads.api";
import { reportError } from "@/services/monitoring";
import { useTranslation } from "@/i18n/useTranslation";

type UploadState = "idle" | "uploading" | "done" | "error";

export interface PresignedFileUploadProps {
  type: UploadType;
  accept: string;
  label: string;
  value?: string;
  onUploaded: (url: string) => void;
}

const UPLOAD_FAILED: UploadValidationError = { key: "common.upload.failed" };

export const PresignedFileUpload = ({
  type,
  accept,
  label,
  value,
  onUploaded,
}: PresignedFileUploadProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(value ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<UploadValidationError | null>(null);
  const cancelledRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const hadValueRef = useRef(!!value);

  useEffect(() => () => abortRef.current?.abort(), []);

  const startUpload = async (file: File) => {
    setState("uploading");
    setProgress(0);
    setError(null);
    cancelledRef.current = false;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const url = await uploadViaPresign(file, type, {
        signal: controller.signal,
        onProgress: setProgress,
      });
      onUploaded(url);
      hadValueRef.current = true;
      setState("done");
    } catch (err) {
      if (cancelledRef.current) {
        setState(hadValueRef.current ? "done" : "idle");
        return;
      }
      reportError(err);
      setState("error");
      setError(UPLOAD_FAILED);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateFile(file, type);
    if (validationError) {
      setState("error");
      setError(validationError);
      return;
    }

    void startUpload(file);
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
  };

  return (
    <div className="space-y-1.5">
      <input
        accept={accept}
        className="hidden"
        ref={inputRef}
        type="file"
        onChange={handleChange}
      />
      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-10 border border-neutral-200 bg-white px-3.5 py-2 text-[13px] font-medium text-neutral-700 transition-colors hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
          disabled={state === "uploading"}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {state === "done" ? (
            <Check className="text-brand-600" size={14} />
          ) : (
            <Upload size={14} />
          )}
          {state === "uploading"
            ? t("common.upload.uploading")
            : state === "done"
              ? t("common.upload.uploaded", { label })
              : label}
          {state === "uploading" && `${progress}%`}
        </button>
        {state === "uploading" && (
          <button
            aria-label={t("common.upload.cancel")}
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
            type="button"
            onClick={handleCancel}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {state === "uploading" && (
        <div className="h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && (
        <p className="text-[12px] text-danger-600" role="alert">
          {t(error.key, error.params)}
        </p>
      )}
    </div>
  );
};

export const FileUpload = PresignedFileUpload;
