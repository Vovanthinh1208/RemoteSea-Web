import { useQuery } from "@tanstack/react-query";
import { listCategories, listSkills } from "@/features/taxonomy/taxonomy.service";
import { taxonomyKeys } from "@/core/query/query-keys";
import { TIER } from "@/core/query/query-client";

export const useCategories = () =>
  useQuery({
    queryKey: taxonomyKeys.categories(),
    queryFn: ({ signal }) => listCategories({ signal }),
    ...TIER.reference,
  });

export const useSkills = (q?: string) =>
  useQuery({
    queryKey: taxonomyKeys.skills(q),
    queryFn: ({ signal }) => listSkills(q, { signal }),
    ...TIER.reference,
  });
