import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { encodeProposalShare } from "@/lib/share-codec";
import { loadShare } from "@/lib/share-store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const record = await loadShare(id);
  if (!record) return { title: "共有が見つかりません — ふらり" };
  return {
    title: `${record.proposal.name} — ふらり`,
    description: record.proposal.hook,
  };
}

/** 旧形式 /share/[id] — 見つかれば新URLへ、なければ404 */
export default async function LegacySharePage({ params }: Props) {
  const { id } = await params;
  const record = await loadShare(id);
  if (!record) notFound();

  const token = encodeProposalShare(record.proposal);
  redirect(`/share?p=${encodeURIComponent(token)}`);
}
