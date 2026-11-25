'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import { CartProvider, FloatingContactWidget } from '@deneb-ui/ui';
import { LoomeStoreProvider } from '@/lib/storeContext';
import LoomeAnnouncementBar from './LoomeAnnouncementBar';
import LoomeNavbar from './LoomeNavbar';
import LoomeFooter from './LoomeFooter';
import LoomeOverlays from './LoomeOverlays';
import { ThemeToggle } from './ThemeToggle';

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = (usePathname() || '/').replace(/\/+$/, '') || '/';
  const isStandaloneSilkIntro =
    pathname === '/silk-intro-preview' || pathname.endsWith('/silk-intro-preview');

  return (
    <MotionConfig reducedMotion="user">
      <CartProvider storageKey="loome_atelier_cart_v1">
        <LoomeStoreProvider>
          <div className="site-shell">
            {isStandaloneSilkIntro ? (
              <main className="min-h-screen">{children}</main>
            ) : (
              <>
                <LoomeAnnouncementBar />
                <LoomeNavbar />
                <main>{children}</main>
                <LoomeFooter />
                <LoomeOverlays />
                <FloatingContactWidget />
                <div className="fixed bottom-6 left-6 z-30">
                  <ThemeToggle className="rounded-[11px] border border-[#49382D]/20 bg-white/95 text-[#49382D] shadow-md backdrop-blur-md dark:border-[#C8A98B]/30 dark:bg-[#28211D]/95 dark:text-[#F5EEE6]" />
                </div>
              </>
            )}
          </div>
        </LoomeStoreProvider>
      </CartProvider>
    </MotionConfig>
  );
}
