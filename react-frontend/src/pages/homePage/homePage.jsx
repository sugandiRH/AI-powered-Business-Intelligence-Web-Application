import Navbar from '../../component/Navbar.jsx';
import Footer from '../../component/Footer.jsx';
import HeroSection from './heroSection.jsx';
import Solution from './Solution.jsx';
import Feature from './Feature.jsx';

function Homepage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <Solution />
      <Feature />
      <Footer />
    </div>
  )
}

export default Homepage ;