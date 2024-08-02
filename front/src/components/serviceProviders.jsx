import React from 'react';
import blanchisserie from "../assets/images/blanchisserie.jpg" 

function ServiceProviders() {
  return (
    <>
    <div>
      <div id="services" className="box row vertical-align">
          <div className="col-md-6 align-self-center box-margin-right">
              <img src={blanchisserie}className="img-fluid" width="650px"></img>
          </div>
          <div className="col-md-6">
              <h2>Rejoignez notre réseau de prestataire</h2>
              <p>Découvrez de nouvelles opportunités en collaborant avec nous en tant que prestataire de services. Que vous soyez un chauffeur de taxi, une blanchisserie, un service de ménage ou de bricolage, nous vous invitons à rejoindre notre réseau.</p>
              <p>Nous prenons en charge toute la gestion, vous permettant de vous concentrer sur votre intervention en toute tranquillité d'esprit.</p>
              <div className="d-grid gap-2 col-6 mx-auto btn-margin">
                  <button className="btn btn-dark btn-hover-brown" type="button">Nous rejoindre</button>
              </div>
          </div>
      </div>
    </div>
    </>

  );
}

export default ServiceProviders;
