import { AppShell } from "@/components/AppShell";

export default function PayerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="PAYER">{children}</AppShell>;
}
