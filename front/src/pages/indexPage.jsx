import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/style.css';
import Hero from '../components/hero';
import OurMission from '../components/ourMission';
import AboutUs from '../components/aboutUs';

import Head from '../components/head';
import OurServices from '../components/ourServices';

export default function IndexPage() {
  return (
    <>
    <div>
      <Head/>
      <Hero />
      <OurMission />
      <AboutUs />
      <OurServices />


    </div>
    </>
  );
}