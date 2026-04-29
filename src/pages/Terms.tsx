import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | oops!Pleasured</title>
        <meta name="description" content="View our terms of service, payment terms, and liability limits." />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 md:py-24 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-cyan-text text-center">Terms of Service</h1>
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Order Processing</h2>
              <p>By placing an order with Oops I Pleasured, you confirm that you are at least 18 years of age. All orders are subject to availability and internal review. We reserve the right to decline or cancel orders at our discretion.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Pricing and Payments</h2>
              <p>All product prices are listed in INR and are inclusive of applicable taxes. Payment must be completed via our secure gateway or opted as Cash on Delivery prior to the handover of the package.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Limitation of Liability</h2>
              <p>Our products are designed strictly for personal use. Oops I Pleasured shall not be held liable for any indirect or consequential damages arising from the misuse of products. Please read all manufacturer guidelines and safety instructions before use.</p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Terms;
