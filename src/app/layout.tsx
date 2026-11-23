import type { Metadata } from "next";
import type { ReactNode } from "react";
import siteData from "@/data/site-data.json";
import { SiteDataProvider, ThemeStyles } from "@/lib/siteDataContext";
import { withBasePath } from "@/lib/utils";
import SiteChrome from "@/components/SiteChrome";
import './globals.css';
import '../fonts/deneb-fonts.css';

export async function generateMetadata(): Promise<Metadata> {
  const sd = siteData as any;
  const common = sd?.content?.common;
  const shop = sd?.shop;

  const title =
    common?.websiteTitle ||
    shop?.businessName ||
    "Storefront";

  const description =
    common?.shortDescription ||
    shop?.description ||
    "A modern digital storefront powered by Fivora DENEB UI.";

  const icon =
    common?.logoUrl ||
    shop?.logoUrl ||
    "/fivora-icon.svg";

  return {
    title,
    description,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const sd = siteData as any;
  const initialTheme = sd?.template?.structure?.theme || sd?.theme;
  const silkIntro = sd?.content?.home?.silkIntro;
  const silkEnabled = silkIntro?.enabled !== false;
  const silkBgUrl = withBasePath(
    typeof silkIntro?.backgroundImageUrl === "string" && silkIntro.backgroundImageUrl.trim()
      ? silkIntro.backgroundImageUrl
      : "/images/silk-veil-bg.jpg",
  );
  const basePath = (process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "").replace(/\/$/, "");

  const silkBootScript = `(function(){try{var h=document.documentElement;var p=window.location.pathname||'/';var norm=p.replace(/\\/+$/,'')||'/';var bp=${JSON.stringify(basePath)};var isHome=norm==='/'||(bp&&norm===bp)||norm.endsWith('/index.html');var isSilkPreview=norm.indexOf('/silk-intro-preview')!==-1;var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=false;try{seen=window.sessionStorage.getItem('loome_silk_veil_seen_v1')==='1';}catch(e){}var inPreview=window.parent!==window||p.indexOf('/template-validation')!==-1||p.indexOf('/template-preview')!==-1||p.indexOf('/preview')!==-1;var enabled=${silkEnabled ? "true" : "false"};if(isSilkPreview){h.setAttribute('data-silk-intro','preview-page');}else if(!isHome){h.setAttribute('data-silk-intro','off');}else if(inPreview){h.setAttribute('data-silk-intro','editor');}else if(!enabled||reduced||seen){h.setAttribute('data-silk-intro','skip');}else{h.setAttribute('data-silk-intro','pending');}}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeStyles theme={initialTheme} enableDualMode />
        {silkEnabled && <link rel="preload" as="image" href={silkBgUrl} />}
        <script dangerouslySetInnerHTML={{ __html: silkBootScript }} />
      </head>
      <body suppressHydrationWarning>
        <SiteDataProvider initialSiteData={siteData}>
          <SiteChrome>{children}</SiteChrome>
        </SiteDataProvider>
      </body>
    </html>
  );
}
