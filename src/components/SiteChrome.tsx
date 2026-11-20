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
              <ThemeToggle className="border border-[#262923]/15 bg-[#F8F6F1]/90 shadow-md backdrop-blur-md dark:border-[#F8F6F1]/15 dark:bg-[#20231D]/90" />
            </div>
          </div>
        </LoomeStoreProvider>
      </CartProvider>
    </MotionConfig>
  );
}
