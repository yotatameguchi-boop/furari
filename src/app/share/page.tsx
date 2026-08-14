import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalCard } from "@/components/proposal-card";
import { decodeProposalShare } from "@/lib/share-codec";

type Props = {
  searchParams: Promise<{ p?: string }>;
};

function proposalMetadata(proposal: { name: string; hook: string }): Metadata {
  return {
    title: `${proposal.name} — ふらり`,
    description: proposal.hook,
    openGraph: {
      title: `${proposal.name} — ふらり`,
      description: proposal.hook,
      type: "website",
    },
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { p } = await searchParams;
  if (!p) return { title: "共有が見つかりません — ふらり" };
  const proposal = decodeProposalShare(p);
  if (!proposal) return { title: "共有が見つかりません — ふらり" };
  return proposalMetadata(proposal);
}

export default async function SharePage({ searchParams }: Props) {
  const { p } = await searchParams;
  if (!p) notFound();

  const proposal = decodeProposalShare(p);
  if (!proposal) notFound();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent)] uppercase">
          共有された旅の提案
        </p>
        <h1 className="font-serif text-3xl text-[var(--ink)] sm:text-4xl">{proposal.name}</h1>
        <p className="text-sm text-[var(--muted)]">ふらりでつくられた提案</p>
        <Link href="/" className="link-chip inline-flex">
          自分もふらりで探す
        </Link>
      </header>

      <ProposalCard proposal={proposal} showShare={false} />
    </div>
  );
}
