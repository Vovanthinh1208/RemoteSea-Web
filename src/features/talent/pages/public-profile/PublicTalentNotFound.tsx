import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const PublicTalentNotFound = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
    <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
      <UserX size={20} />
    </div>
    <h1 className="text-2xl font-semibold text-neutral-900">
      Profile not found
    </h1>
    <p className="mt-2 text-sm text-neutral-500">
      This talent profile doesn&apos;t exist or was removed.
    </p>
    <Link className="mt-6" to={ROUTES.jobs}>
      <Button variant="primary">Browse jobs</Button>
    </Link>
  </div>
);
