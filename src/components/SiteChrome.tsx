'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { CartProvider, FloatingContactWidget, getThemeCssProperties } from '@deneb-ui/ui';
import { useSiteData } from '@/lib/siteDataContext';
import { LoomeStoreProvider } from '@/lib/storeContext';
import LoomeAnnouncementBar from './LoomeAnnouncementBar';
import LoomeNavbar from './LoomeNavbar';
import LoomeFooter from './LoomeFooter';
import LoomeOverlays from './LoomeOverlays';
import { ThemeToggle } from './ThemeToggle';

export default function SiteChrome({ children }: { children: ReactNode }) {
  const siteData = useSiteData();
  const themeStyle = getThemeCssProperties(
    siteData?.template?.structure?.theme as any,
  );

  return (
    <MotionConfig reducedMotion="user">
      <CartProvider storageKey="loome_atelier_cart_v1">
        <LoomeStoreProvider>
          <div className="site-shell" style={themeStyle}>
            <LoomeAnnouncementBar />
            <LoomeNavbar />
            <main>{children}</main>
            <LoomeFooter />
            <LoomeOverlays />
            <FloatingContactWidget />
            <div className="fixed bottom-6 left-6 z-30">
              <ThemeToggle className="rounded-[11px] border border-[#C8A98B]/30 bg-[#3B302B]/90 text-[#F2E9DE] shadow-md backdrop-blur-md" />
            </div>
          </div>
        </LoomeStoreProvider>
      </CartProvider>
    </MotionConfig>
  );
}
