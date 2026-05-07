import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const Returns = () => {
  return (
    <>
      <SEO
        title="Returns & Refunds"
        description="Read our policy on returns, refunds, and replacements for damaged items."
        canonicalUrl="https://oopsipleasured.in/returns"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 md:py-24 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-cyan-text text-center">Returns & Refunds</h1>
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Hygiene and Safety First</h2>
              <p>As a premium intimate wellness brand, the health and safety of our community are paramount. Due to the highly sensitive and hygienic nature of our products, we do not accept returns or exchanges once the original packaging seal has been broken or the product has been opened.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Damaged or Defective Items</h2>
              <p>Your experience should be flawless. In the rare event that you receive a damaged or defective item, please reach out to our concierge team within 48 hours of delivery. We will initiate a prompt review and arrange for a seamless replacement of the affected product, completely free of charge.</p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Returns;
