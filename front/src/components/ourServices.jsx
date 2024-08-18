import React from "react";
import { useNavigate } from "react-router-dom";


function OurServices() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/account/services");  // Redirige vers la page des services proposés
    };

    return (
        <section className="our-services-section">
            <div className="container">
                <div className="text-center">
                    <h2>Nos Services</h2>
                    <p className="fs-6 mb-4">Découvrez une variété de services que nous proposons pour répondre à tous vos besoins. Que vous recherchiez de l'aide pour des tâches spécifiques ou des services spécialisés, notre équipe est là pour vous assister.</p>
                    <button className="btn btn-dark btn-hover-brown" onClick={handleClick}>
                        Voir nos services proposés
                    </button>
                </div>
            </div>
        </section>
    );
}

export default OurServices;
