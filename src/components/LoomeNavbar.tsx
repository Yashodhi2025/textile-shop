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
  { id: 'home', fallbackLabel: 'Home', route: '/' },
  { id: 'shop', fallbackLabel: 'Shop', route: '/shop' },
  { id: 'services', fallbackLabel: 'Collections', route: '/services' },
  { id: 'journal', fallbackLabel: 'Journal', route: '/journal' },
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
  const mobileTagline = contentText(common.footerTagline) || 'The Art of Fine Textiles';

  const requiredPages = Array.isArray(siteData.requirements?.requiredPages)
    ? siteData.requirements.requiredPages
    : siteData.template?.structure?.pages || ['home', 'shop', 'services', 'journal', 'about_us', 'contact'];

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
    if (cleanRoute === '/journal') {
      return cleanPath === '/journal' || cleanPath.startsWith('/journal/');
    }
    return cleanPath === cleanRoute;
  };

  return (
    <>
      <header
        data-design-section="navbar"
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${scrolled
          ? 'loome-navbar-surface-scrolled border-b border-[#C8A98B]/24 shadow-[0_10px_32px_rgba(12,9,8,0.38)] backdrop-blur-md'
          : 'loome-navbar-surface border-b border-[#C8A98B]/16 backdrop-blur-md'
          }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-4 transition-all duration-500 sm:px-8 lg:px-12 ${scrolled ? 'h-[68px]' : 'h-[82px]'
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[#F2E9DE] transition-colors hover:bg-[#3B302B] hover:text-[#C8A98B] lg:hidden"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>

            <nav className="hidden items-center gap-3.5 lg:flex xl:gap-5 2xl:gap-6">
              {NAV_ITEMS.map((item) => {
                const isEnabled = item.id === 'home' || requiredPages.includes(item.id);
                const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                const active = isRouteActive(item.route);
                const labelEl =
                  item.id === 'home' ? (
                    <span data-preview-field-path="common.navLabels.home">{label}</span>
                  ) : item.id === 'shop' ? (
                    <span data-preview-field-path="common.navLabels.shop">{label}</span>
                  ) : item.id === 'services' ? (
                    <span data-preview-field-path="common.navLabels.services">{label}</span>
                  ) : item.id === 'journal' ? (
                    <span data-preview-field-path="common.navLabels.journal">{label}</span>
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
                        aria-current={active ? 'page' : undefined}
                        className={`loome-nav-link whitespace-nowrap border-0 bg-transparent px-0 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors xl:text-[11px] xl:tracking-[0.2em] ${
                          active
                            ? 'text-[#C8A98B]'
                            : 'text-[#F2E9DE]/78 hover:text-[#F2E9DE]'
                        }`}
                      >
                        {labelEl}
                      </button>
                    ) : (
                      <span className="unavailable whitespace-nowrap text-[10.5px] uppercase tracking-[0.18em] text-[#F2E9DE]/45 xl:text-[11px] xl:tracking-[0.2em]">
                        {labelEl}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>

          {/* Center: LOOMÉ Editorial Wordmark (selective Cormorant Garamond signature) */}
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
                className="h-7 w-7 rounded-[6px] object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <span
                data-preview-field-path="common.websiteTitle"
                className="font-serif text-[26px] font-medium leading-none tracking-[0.28em] text-[#F2E9DE] transition-colors group-hover:text-[#C8A98B] sm:text-[30px]"
              >
                {siteTitle}
              </span>
            </button>
          </div>

          {/* Right: Atelier Link + Utility Icons */}
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2.5">
            <span data-target-page="contact" className="mr-2 hidden 2xl:inline-flex">
              {requiredPages.includes('contact') ? (
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="loome-nav-link border-0 bg-transparent px-0 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C8A98B] transition-colors hover:text-[#F2E9DE]"
                >
                  <span data-preview-field-path="common.headerCtaLabel">{headerCtaLabel}</span>
                </button>
              ) : (
                <span
                  className="unavailable text-[10px] uppercase tracking-[0.22em] text-[#C8A98B]/50"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[#F2E9DE]/85 transition-colors hover:bg-[#3B302B] hover:text-[#C8A98B]"
            >
              <Search className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={openAccount}
              aria-label="Client atelier account"
              data-preview-static="header-account-btn"
              className="hidden h-10 w-10 items-center justify-center rounded-[10px] text-[#F2E9DE]/85 transition-colors hover:bg-[#3B302B] hover:text-[#C8A98B] sm:inline-flex"
            >
              <User className="h-[18px] w-[18px] stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={openWishlist}
              aria-label={`Saved wishlist (${wishlistCount} items)`}
              data-preview-static="header-wishlist-btn"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[#F2E9DE]/85 transition-colors hover:bg-[#3B302B] hover:text-[#C8A98B]"
            >
              <Heart className="h-[18px] w-[18px] stroke-[1.5]" />
              {wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-[6px] bg-[#C8A98B] px-1 text-[9px] font-bold text-[#201C1A]"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                window.location.assign(withBasePath('/cart/'));
              }}
              aria-label={`Shopping bag (${activeCartCount} items)`}
              aria-current={isRouteActive('/cart') ? 'page' : undefined}
              data-preview-static="header-cart-btn"
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors hover:bg-[#3B302B] hover:text-[#C8A98B] ${
                isRouteActive('/cart')
                  ? 'bg-[#3B302B] text-[#C8A98B]'
                  : 'text-[#F2E9DE]/85'
              }`}
            >
              <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" />
              {activeCartCount > 0 && (
                <motion.span
                  key={activeCartCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-[6px] bg-[#C8A98B] px-1 text-[9px] font-bold text-[#201C1A]"
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
              className="fixed inset-0 bg-[#120F0E]/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              aria-label="Mobile navigation drawer"
              className="relative z-10 flex h-full w-[86%] max-w-sm flex-col justify-between border-r border-[#C8A98B]/20 bg-[#201C1A] px-7 py-6 text-[#F2E9DE] shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#C8A98B]/18 pb-5">
                  <span className="font-serif text-2xl tracking-[0.26em] text-[#F2E9DE]">{siteTitle}</span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#C8A98B]/25 text-[#F2E9DE] transition-colors hover:border-[#C8A98B] hover:text-[#C8A98B]"
                  >
                    <X className="h-4 w-4 stroke-[1.5]" />
                  </button>
                </div>

                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8A98B]">
                  {mobileTagline}
                </p>

                <nav className="mt-5 flex flex-col divide-y divide-[#C8A98B]/12">
                  {NAV_ITEMS.map((item, idx) => {
                    const isEnabled = item.id === 'home' || requiredPages.includes(item.id);
                    const label = contentText(navLabels[item.id]) || item.fallbackLabel;
                    const active = isRouteActive(item.route);
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
                            data-active={active ? 'true' : 'false'}
                            aria-current={active ? 'page' : undefined}
                            className={`flex w-full items-center justify-between border-0 bg-transparent py-4 text-left font-heading text-xl font-bold tracking-tight transition-colors ${active
                              ? 'text-[#C8A98B]'
                              : 'text-[#F2E9DE] hover:text-[#C8A98B]'
                              }`}
                          >
                            <span className="inline-flex items-center gap-2.5">
                              {active && (
                                <span
                                  aria-hidden="true"
                                  className="h-1.5 w-1.5 rounded-full bg-[#C8A98B]"
                                />
                              )}
                              <span>{label}</span>
                            </span>
                            <span className="text-xs text-[#C8A98B]">→</span>
                          </button>
                        ) : (
                          <span className="unavailable block py-4 font-heading text-xl font-bold">{label}</span>
                        )}
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-3 border-t border-[#C8A98B]/18 pt-5">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openAccount();
                    }}
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-[#C8A98B]/28 bg-[#3B302B]/55 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F2E9DE] transition-colors hover:border-[#C8A98B]"
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
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-[#C8A98B]/28 bg-[#3B302B]/55 py-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#F2E9DE] transition-colors hover:border-[#C8A98B]"
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
