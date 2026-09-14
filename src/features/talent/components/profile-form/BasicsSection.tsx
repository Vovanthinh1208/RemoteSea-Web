import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import {
  SectionHead,
  EMPHASIS_STYLE,
} from "@/features/talent/components/profile-form/SectionHead";
import { FieldError } from "@/components/shared/FieldError";
import {
  SELECT_INPUT_CLASS,
  TEXT_INPUT_CLASS,
} from "@/components/shared/input-styles";
import { TIMEZONE_OPTIONS } from "@/features/talent/talent.constants";
import type { ProfileFormValues } from "@/features/talent/talent.schemas";
import {
  useMyAccount,
  useUpdateMyAccount,
} from "@/features/users/users.queries";
import { useToast } from "@/components/ui/toast";
import { useToastMutation } from "@/hooks/useToastMutation";
import { uploadViaPresign, validateFile } from "@/services/uploads.api";
import { reportError } from "@/services/monitoring";

interface BasicsSectionProps {
  register: UseFormRegister<ProfileFormValues>;
  name: string;
  nameError?: string;
  headlineError?: string;
  headlineLength: number;
}

const MAX_HEADLINE_LENGTH = 80;

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const BasicsSection = ({
  register,
  name,
  nameError,
  headlineError,
  headlineLength,
}: BasicsSectionProps) => {
  const { data: account } = useMyAccount();
  const updateAccountMutation = useUpdateMyAccount();
  const runWithToast = useToastMutation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateFile(file, "avatar");
    if (validationError) {
      toast({
        variant: "error",
        title: "Couldn't upload photo",
        description: validationError,
      });
      return;
    }

    setUploading(true);
    try {
      const url = await uploadViaPresign(file, "avatar");
      await runWithToast(
        () => updateAccountMutation.mutateAsync({ image: url }),
        {
          success: "Photo updated",
          error: "Couldn't update your photo",
        }
      );
    } catch (err) {
      reportError(err);
      toast({
        variant: "error",
        title: "Upload failed",
        description: "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () =>
    runWithToast(() => updateAccountMutation.mutateAsync({ image: null }), {
      success: "Photo removed",
      error: "Couldn't remove your photo",
    });

  return (
    <section
      className="scroll-mt-6 rounded-20 border border-neutral-100 bg-white p-7"
      id="basics"
    >
      <SectionHead
        eyebrow="01 · Identity"
        help="Your name, headline, location and timezone. This appears at the top of your profile."
        title={
          <>
            The{" "}
            <em
              className="font-serif italic text-brand-700"
              style={EMPHASIS_STYLE}
            >
              basics.
            </em>
          </>
        }
      />
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-[20px] font-bold text-white">
          {account?.image ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              src={account.image}
            />
          ) : (
            getInitials(name) || "?"
          )}
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-neutral-700 text-white">
            <Plus size={10} />
          </span>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-neutral-900">
            {name || "Your name"}
          </p>
          <p className="text-[12px] text-neutral-400">
            JPG or PNG · square crop · max 2 MB
          </p>
          <div className="mt-2 flex gap-2">
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
            />
            <button
              className="rounded-8 border border-neutral-200 bg-white px-3 py-1 text-[12px] font-medium text-neutral-700 hover:border-neutral-300 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
              disabled={uploading}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            <button
              className="rounded-8 px-2 py-1 text-[12px] text-neutral-400 hover:text-neutral-600 focus-visible:shadow-focus focus-visible:outline-none disabled:opacity-60"
              disabled={!account?.image || updateAccountMutation.isPending}
              type="button"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="p-name"
          >
            Full name
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="p-name"
            {...register("name")}
          />
          <FieldError message={nameError} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[12.5px] font-medium text-neutral-700">
            Pronouns{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </p>
          {/* Not a real input — there's no field for this yet. A disabled-but-
            normal-looking input invited users to click in, type, and find
            nothing saves. */}
          <p className="text-[13.5px] text-neutral-400">Coming soon</p>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label
              className="block text-[12.5px] font-medium text-neutral-700"
              htmlFor="p-headline"
            >
              Headline
            </label>
            <span className="text-[11px] text-neutral-400">
              {headlineLength} / {MAX_HEADLINE_LENGTH}
            </span>
          </div>
          <input
            className={TEXT_INPUT_CLASS}
            id="p-headline"
            placeholder="Role · timezone · standout signal"
            {...register("headline")}
          />
          <FieldError message={headlineError} />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="p-loc"
          >
            Where are you based?
          </label>
          <input
            className={TEXT_INPUT_CLASS}
            id="p-loc"
            {...register("location")}
          />
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-[12.5px] font-medium text-neutral-700"
            htmlFor="p-tz"
          >
            Working timezone
          </label>
          <select
            className={SELECT_INPUT_CLASS}
            id="p-tz"
            {...register("timezone")}
          >
            {TIMEZONE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};
