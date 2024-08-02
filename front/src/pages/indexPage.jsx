import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/style.css';
import Hero from '../components/hero';
import OurMission from '../components/ourMission';
import AboutUs from '../components/aboutUs';
import Reviews from '../components/reviews';
import Merchant from '../components/merchant';
import ServiceProviders from '../components/serviceProviders';

import Head from '../components/head';

export default function IndexPage() {
  return (
    <>
    <div>
      <Head/>
      <Hero />
      <OurMission />
      <AboutUs />
      <Reviews />
      <Merchant />
      <ServiceProviders />

    </div>
    </>
  );
}