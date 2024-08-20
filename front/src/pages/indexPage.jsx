import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/style.css';
import Hero from '../components/hero';
import AboutUs from '../components/aboutUs';

import Head from '../components/head';
import OurServices from '../components/ourServices';
import OurProducts from '../components/ourProducts';

export default function IndexPage() {
  return (
    <>
    <div>
      <Head/>
      <Hero />
      <AboutUs />
      <OurServices />
      <OurProducts />


    </div>
    </>
  );
}