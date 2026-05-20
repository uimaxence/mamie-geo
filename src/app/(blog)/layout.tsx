import { MarketingFooter } from "../(marketing)/_sections/marketing-footer";
import { MarketingHeader } from "../(marketing)/_sections/marketing-header";

// Layout du route group (blog), réutilise le header/footer marketing
// pour qu'un lecteur blog ait la même navigation que sur la home.

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </>
  );
}
