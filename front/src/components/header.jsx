import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import iconDark from '../assets/logos/logo.png';
import titleDark from '../assets/logos/title_dark.png';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
// Supposons que vous ayez un contexte utilisateur
import { UserContext } from '../userContext.jsx';

function Header() {
    const { user } = useContext(UserContext);

    return (
    <>
    <header>
        <div className="row p-3 d-flex justify-content-center align-items-center">
            <div className="col-2">
            {/* <!-- Barre de navigation --> */}
            <nav className="navbar bg-body-tertiary">
                <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbarLight">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbarLight">
                    <div className="offcanvas-header">
                    {/* <!-- Image du menu --> */}
                    <Link to="/"><img src={iconDark} alt="Icon" className="img-fluid" width="50px"></img></Link>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body">
                    <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                        <li className="nav-item">
                        <Link to="/"><a className="nav-link active" aria-current="page" >Accueil</a></Link>
                        
                        </li>
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Votre compte
                        </a>
                        <ul className="dropdown-menu">
                            <Link to="/account"><li><a className="dropdown-item">Votre profil</a></li></Link>
                            <li><a className="dropdown-item" href="#">Vos documents</a></li>
                            <li><a className="dropdown-item" href="#">Vos comptes</a></li>
                            <Link to="/account/bookings"><li><a className="dropdown-item">Vos réservations</a></li></Link>
                            
                            <li><a className="dropdown-item" href="#">Logements favoris</a></li>
                        </ul>
                        </li>
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Espace bailleur
                        </a>
                        <ul className="dropdown-menu">
                            <Link to="/account/places/new"><li><a className="dropdown-item" href="#">Nouveau bien</a></li></Link>
                                                    
                            <Link to="/account/places"><li><a className="dropdown-item" href="#">Vos biens</a></li></Link>
                            <li><a className="dropdown-item" href="#">Réservations</a></li>
                            <li><a className="dropdown-item" href="#">Vos interventions</a></li>
                        </ul>
                        </li>
                        

                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Espace prestataire
                        </a>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">Nouvelle prestations</a></li>
                            <li><a className="dropdown-item" href="#">Vos prestations</a></li>
                            <li><a className="dropdown-item" href="#">Vos interventions</a></li>
                        </ul>
                        </li>
                        
                        <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Espace administrateur
                        </a>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">Utilisateurs</a></li>
                            <li><a className="dropdown-item" href="#">Biens</a></li>
                            <li><a className="dropdown-item" href="#">Services</a></li>
                            <li><a className="dropdown-item" href="#">Demandes en attente</a></li>
                            <li><a className="dropdown-item" href="#">Documents</a></li>
                            <li><a className="dropdown-item" href="#">Gestion technique</a></li>
                        </ul>
                        </li>
                        
                        <li className="nav-item">
                            <Link to="/stayAll"><a className="nav-link" href="#">Trouvez un logement</a></Link>
                        
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Trouvez un service</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Messagerie</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Contact</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Devenir Premium</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Connectez-vous</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" href="#">Nous rejoindre</a>
                        </li>
                    </ul>
                    {/* <!-- Barre de recherche --> */}
                    <form className="d-flex mt-3" role="search">
                        <input className="form-control me-2" type="search" placeholder="Tapez votre recherche" aria-label="Search"></input>
                        <button className="btn btn-dark" type="submit">Rechercher</button>
                    </form>
                    </div>
                </div>
                </div>
            </nav>
            </div>
            <div className="col text-center">
            {/* <!-- Titre --> */}
            <Link to="/">
            <img src={titleDark} width="200px"></img>
            </Link>
            </div>
            <div className="col-2 text-end d-none d-md-block">
                
            {/* <!-- Bouton de connexion ou compte utilisateur --> */}
            {user ? (
                <Link to="/account">
                <Button variant="dark">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width="35"
                    height="35"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    </svg>
                </Button>
                </Link>
            ) : (
                <div>
                    <Link to="/login"><Button variant="dark">Connexion</Button></Link>
                    <Link to="/register"><Button variant="dark">Inscription</Button></Link>
                </div>
            )}
            </div>
        </div>
        {/* <!-- Séparateur --> */}
        <div className="brown-separator"></div>
        </header>
    </>
    );
}

export default Header;
