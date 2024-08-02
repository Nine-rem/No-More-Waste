import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="py-3 my-4">
      <ul className="nav justify-content-center border-bottom pb-3 mb-3">
        <li className="nav-item">
          <Link to="/" className="nav-link px-2">Accueil</Link>
        </li>
        <li className="nav-item">
          <Link to="/stayAll" className="nav-link px-2">Logement</Link>
        </li>
        <li className="nav-item">
          <Link to="/service" className="nav-link px-2">Service</Link>
        </li>
        <li className="nav-item">
          <Link to="/quotation" className="nav-link px-2">Devis</Link>
        </li>
        <li className="nav-item">
          <Link to="/legal" className="nav-link px-2">Mentions légales</Link>
        </li>
        <li className="nav-item">
          <Link to="/cookies" className="nav-link px-2">Cookies</Link>
        </li>
        <li className="nav-item">
          <Link to="/serviceTerms" className="nav-link px-2">Conditions générales</Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link px-2">Contact</Link>
        </li>
      </ul>
      <p className="text-center">© 2024 PCS | Tous droits réservés</p>
    </footer>
  );
}

export default Footer;
