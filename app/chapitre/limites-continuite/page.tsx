import { Course } from "@/components/course/Course";

type Props = {
  searchParams: Promise<{ section?: string }>;
};

export default async function ChapitrePage({ searchParams }: Props) {
  const params = await searchParams;
  return <Course initialId={params.section} />;
}