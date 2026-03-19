import { DashboardLayout } from '@/components/layout';
import { DemoProvider } from '@/lib/demo';
import { DemoBadge, WalkthroughOverlay } from '@/components/demo';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <DashboardLayout>{children}</DashboardLayout>
      <DemoBadge />
      <WalkthroughOverlay />
    </DemoProvider>
  );
}
