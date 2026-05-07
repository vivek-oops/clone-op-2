import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const AboutUs = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about our brand purpose, focusing on privacy, safety, and a premium intimate wellness experience."
        canonicalUrl="https://oopsipleasured.in/about"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 md:py-24 max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-cyan-text text-center">About Us</h1>
          <div className="glass rounded-2xl p-8 md:p-12 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              At <strong className="text-foreground font-semibold">Oops I Pleasured</strong>, we believe that intimate wellness should be celebrated with elegance, confidence, and uncompromising privacy.
            </p>
            <p>
              We created this space for modern young adults in India who seek a premium, judgment-free approach to personal care. Curated with meticulous attention to detail, our collection features thoughtfully designed products that prioritize both your safety and satisfaction.
            </p>
            <p>
              Your journey is deeply personal. That is why our entire experience—from browsing our curated selections to receiving your package—is crafted to be seamless, secure, and entirely discreet. We are here to elevate your everyday wellness, on your own terms.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
