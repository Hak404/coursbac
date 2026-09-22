import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyChapitre({ searchParams }: Props) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) {
      for (const x of v) qs.append(k, x);
    } else if (typeof v === "string") {
      qs.set(k, v);
    }
  }
  redirect(`/cours/math/2bac/limites-continuite${qs.size ? `?${qs.toString()}` : ""}`);
}