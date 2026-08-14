import Link from "next/link";

export default function ShareNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-serif text-2xl text-[var(--ink)]">共有が見つかりません</h1>
      <p className="text-sm leading-6 text-[var(--muted)]">
        リンクの期限が切れたか、URLが間違っている可能性があります。
      </p>
      <Link href="/" className="link-chip inline-flex">
        ふらりをはじめる
      </Link>
    </div>
  );
}
