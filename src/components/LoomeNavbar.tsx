'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useOptionalCart } from '@deneb-ui/ui';
import { contentObject, contentText, useSiteData } from '@/lib/siteDataContext';
import { useLoomeStore } from '@/lib/storeContext';
import { pageRoute, withBasePath } from '@/lib/utils';
import { LUXURY_EASE } from '@/components/motion/LuxuryReveal';

const NAV_ITEMS = [
  { id: 'shop', fallbackLabel: 'Shop', route: '/shop' },
  { id: 'services', fallbackLabel: 'Collections', route: '/services' },
  { id: 'about_us', fallbackLabel: 'About', route: '/about_us' },
  { id: 'contact', fallbackLabel: 'Contact', route: '/contact' },
] as const;

export default function LoomeNavbar() {
  const siteData = useSiteData();
  const pathname = usePathname() || '/';
  const cart = useOptionalCart();
  const { wishlistIds, openWishlist, openSearch, openAccount } = useLoomeStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = contentObject(siteData.content);
  const common = contentObject(content.common);
  const navLabels = contentObject(common.navLabels);

  const siteTitle = contentText(common.websiteTitle) || 'LOOMÉ';
  const logoUrl = contentText(common.logoUrl) || '/loome-monogram.svg';
  const headerCtaLabel = contentText(common.headerCtaLabel) || 'Private Atelier';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'shop', 'services', 'about_us', 'contact'];

  const activeCartCount = cart?.totalCount ?? 0;
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const navigateTo = (pageId: string) => {
    setMobileOpen(false);
    const route = pageRoute(pageId);
    window.location.href = withBasePath(route);
  };

  const isRouteActive = (route: string) => {
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    const cleanRoute = route.replace(/\/$/, '') || '/';
    return cleanPath === cleanRoute;
  };

  return (
    <>
      <header
        data-design-section="navbar"
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${
          scrolled
            ? 'border-b border-[#262923]/10 bg-[#F8F6F1]/95 shadow-[0_8px_30px_rgba(38,41,35,0.05)] backdrop-blur-md dark:border-[#F8F6F1]/10 dark:bg-[#171915]/95'
            : 'border-b border-[#262923]/8 bg-[#F8F6F1]/88 backdrop-blur-sm dark:border-[#F8F6F1]/8 dark:bg-[#171915]/88'
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-4 transition-all duration-500 sm:px-8 lg:px-12 ${
            scrolled ? 'h-[68px]' : 'h-[82px]'
          }`}
        >
          {/* Left: Mobile Menu Toggle + Desktop Navigation */}
          <div className="flex flex-1 items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              data-preview-static="mobile-menu-toggle"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#262923] transition-colors hover:bg-[#262923]/5 dark:text-[#F8F6F1] lg:hidden"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>

            <nav className="hidden items-center gap-8 lg:flex">
              {NAV_ITEMS.map((item) => {
                const isEnabled = requiredPages.includes(item.id);
                const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                const active = isRouteActive(item.route);
                const labelEl =
                  item.id === 'shop' ? (
                    <span data-preview-field-path="common.navLabels.shop">{label}</span>
                  ) : item.id === 'services' ? (
                    <span data-preview-field-path="common.navLabels.services">{label}</span>
                  ) : item.id === 'about_us' ? (
                    <span data-preview-field-path="common.navLabels.about_us">{label}</span>
                  ) : (
                    <span data-preview-field-path="common.navLabels.contact">{label}</span>
                  );

                return (
                  <span key={item.id} data-target-page={item.id}>
                    {isEnabled ? (
                      <button
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        data-active={active ? 'true' : 'false'}
                        className={`loome-nav-link border-0 bg-transparent px-0 py-1 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors ${
                          active
                            ? 'text-[#262923] dark:text-[#F8F6F1]'
                            : 'text-[#262923]/72 hover:text-[#262923] dark:text-[#F8F6F1]/70 dark:hover:text-[#F8F6F1]'
                        }`}
                      >
                        {labelEl}
                      </button>
                    ) : (
                      <span className="unavailable text-[11px] uppercase tracking-[0.22em]">
                        {labelEl}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          {/* Center: LOOMÉ Editorial Wordmark */}
          <div className="flex shrink-0 items-center justify-center">
            <button
              type="button"
              onClick={() => {
                window.location.href = withBasePath('/');
              }}
              className="group flex items-center gap-2.5 border-0 bg-transparent p-0 text-center"
            >
              <img
                src={withBasePath(logoUrl)}
                alt={siteTitle}
                data-preview-field-path="common.logoUrl"
                className="h-7 w-7 rounded-sm object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span
                data-preview-field-path="common.websiteTitle"
                className="font-serif text-[26px] font-medium leading-none tracking-[0.28em] text-[#262923] transition-colors group-hover:text-[#747B65] dark:text-[#F8F6F1] sm:text-[30px]"
              >
                {siteTitle}
              </span>
            </button>
          </div>

          {/* Right: Atelier Link + Utility Icons */}
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-3">
            <span data-target-page="contact" className="mr-2 hidden xl:inline-flex">
              {requiredPages.includes('contact') ? (
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="loome-nav-link border-0 bg-transparent px-0 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#747B65] transition-colors hover:text-[#262923] dark:text-[#B59B79] dark:hover:text-[#F8F6F1]"
                >
                  <span data-preview-field-path="common.headerCtaLabel">{headerCtaLabel}</span>
                </button>
              ) : (
                <span
                  className="unavailable text-[10px] uppercase tracking-[0.22em]"
                  data-preview-field-path="common.headerCtaLabel"
                >
                  {headerCtaLabel}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={openSearch}
              aria-label="Search textiles"
              data-preview-static="header-search-btn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#262923] transition-colors hover:bg-[#262923]/5 hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
            >
              <Search className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={openAccount}
              aria-label="Client atelier account"
              data-preview-static="header-account-btn"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-[#262923] transition-colors hover:bg-[#262923]/5 hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10 sm:inline-flex"
            >
              <User className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={openWishlist}
              aria-label={`Saved wishlist (${wishlistCount} items)`}
              data-preview-static="header-wishlist-btn"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#262923] transition-colors hover:bg-[#262923]/5 hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
            >
              <Heart className="h-[18px] w-[18px] stroke-[1.5]" />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B59B79] px-1 text-[9px] font-semibold text-[#F8F6F1]"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={() => cart?.toggleCart()}
              aria-label={`Shopping bag (${activeCartCount} items)`}
              data-preview-static="header-cart-btn"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[#262923] transition-colors hover:bg-[#262923]/5 hover:text-[#747B65] dark:text-[#F8F6F1] dark:hover:bg-[#F8F6F1]/10"
            >
              <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" />
              {activeCartCount > 0 && (
                <motion.span
                  key={activeCartCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#262923] px-1 text-[9px] font-semibold text-[#F8F6F1] dark:bg-[#B59B79]"
                >
                  {activeCartCount > 99 ? '99+' : activeCartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Luxury Slide-Over Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-[#262923]/45 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Mobile navigation drawer"
              className="relative z-10 flex h-full w-[86%] max-w-sm flex-col justify-between bg-[#F8F6F1] px-7 py-6 text-[#262923] shadow-2xl dark:bg-[#171915] dark:text-[#F8F6F1]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#262923]/10 pb-5 dark:border-[#F8F6F1]/10">
                  <span className="font-serif text-2xl tracking-[0.26em]">{siteTitle}</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#262923]/15 text-[#262923] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]"
                  >
                    <X className="h-4 w-4 stroke-[1.5]" />
                  </button>
                </div>

                <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-[#747B65]">
                  The Art of Fine Textiles
                </p>

                <nav className="mt-5 flex flex-col divide-y divide-[#262923]/8 dark:divide-[#F8F6F1]/8">
                  {NAV_ITEMS.map((item, idx) => {
                    const isEnabled = requiredPages.includes(item.id);
                    const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + idx * 0.05, duration: 0.4, ease: LUXURY_EASE }}
                      >
                        {isEnabled ? (
                          <button
                            type="button"
                            onClick={() => navigateTo(item.id)}
                            className="flex w-full items-center justify-between border-0 bg-transparent py-4 text-left font-serif text-2xl font-normal tracking-wide text-[#262923] transition-colors hover:text-[#747B65] dark:text-[#F8F6F1]"
                          >
                            <span>{label}</span>
                            <span className="text-xs text-[#B59B79]">→</span>
                          </button>
                        ) : (
                          <span className="unavailable block py-4 font-serif text-2xl">{label}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-3 border-t border-[#262923]/10 pt-5 dark:border-[#F8F6F1]/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openAccount();
                    }}
                    className="flex items-center justify-center gap-2 border border-[#262923]/15 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[#262923] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]"
                  >
                    <User className="h-3.5 w-3.5 stroke-[1.5]" />
                    Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openWishlist();
                    }}
                    className="flex items-center justify-center gap-2 border border-[#262923]/15 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[#262923] dark:border-[#F8F6F1]/20 dark:text-[#F8F6F1]"
                  >
                    <Heart className="h-3.5 w-3.5 stroke-[1.5]" />
                    Saved ({wishlistCount})
                  </button>
                </div>
                {requiredPages.includes('contact') && (
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="loome-btn-primary w-full"
                  >
                    {headerCtaLabel}
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
