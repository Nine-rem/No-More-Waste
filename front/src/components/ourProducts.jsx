import React from "react";
import { useNavigate } from "react-router-dom";


function OurServices() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/products/all");  // Redirige vers la page des services proposés
    };

    return (
        <section className="our-services-section">
            <div className="container">
                <div className="text-center">
                    <h2>Nos produits</h2>
                    <p className="fs-6 mb-4">Découvrez une variété de produits que nous proposons. Vous avez le pouvoir de donner une deuxème chance a ceux qu'on ne voulait plus.</p>
                    <button className="btn btn-dark btn-hover-brown" onClick={handleClick}>
                        Voir nos produits proposés
                    </button>
                </div>
            </div>
        </section>
    );
}

export default OurServices;
