import { AppShell } from "@/components/AppShell";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="PROVIDER">{children}</AppShell>;
}
