export default function EnvBanner() {
  if (process.env.NEXT_PUBLIC_SITE_ENV === "production") return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold">
      ⚠️ STAGING ENVIRONMENT — not for customers
    </div>
  )
}

