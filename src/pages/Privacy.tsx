import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Our commitment to your privacy, data security, and discreet billing."
        canonicalUrl="https://oopsipleasured.in/privacy"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 md:py-24 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-cyan-text text-center">Privacy Policy</h1>
          <div className="glass rounded-2xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Your Data is Secure</h2>
              <p>Trust is the foundation of Oops I Pleasured. We employ industry-leading encryption to ensure your personal, billing, and browsing data remain strictly confidential and protected at all times.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Zero Third-Party Sharing</h2>
              <p>Your information belongs to you. We vow never to sell, rent, or recklessly share your personal details with third-party marketers. Data is only utilized to securely process your order and enhance your personal shopping experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold font-display text-foreground mb-3">Discreet Billing</h2>
              <p>For added discretion, your financial statements and credit card bills will reflect a generic, neutral corporate name, ensuring your purchases remain entirely private.</p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;
