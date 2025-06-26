
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HairdressersList from '@/components/HairdressersList';
import ServicesSection from '@/components/ServicesSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HairdressersList />
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
