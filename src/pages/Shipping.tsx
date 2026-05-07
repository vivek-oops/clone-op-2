import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const Shipping = () => {
  return (
    <>
      <SEO
        title="Shipping & Delivery"
        description="Information on our discreet packaging delivery timelines and payment options."
        canonicalUrl="https://oopsipleasured.in/shipping"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 md:py-24 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-cyan-text text-center">Shipping & Delivery</h1>
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Uncompromising Privacy, Guaranteed</h2>
              <p>Your privacy is our highest priority. Every order is shipped in plain, unbranded packaging with absolutely no mention of the product contents or our brand name on the exterior. It arrives looking like any standard premium delivery.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Delivery Timelines</h2>
              <p className="mb-2">We partner with trusted, secure logistics providers to ensure your package reaches you safely.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Dispatch:</strong> Orders are processed and dispatched within 24 hours.</li>
                <li><strong className="text-foreground">Delivery:</strong> Standard delivery across India takes between 3 to 7 business days, depending on your location.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Payment Options</h2>
              <p>For your convenience and peace of mind, we offer both secure online prepaid options and Cash on Delivery (COD) across serviceable pin codes in India.</p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Shipping;
