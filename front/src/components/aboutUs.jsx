import React from 'react';

import equipePcs from '../assets/images/equipe-pcs.jpg';

function AboutUs() {
  return (
    <div id="services" className="box lightgrey-box row vertical-align">
      <div className="col-md-6 align-self-center box-margin-right">
        <img src={equipePcs} className="img-fluid" width="650px" alt="Équipe PCS"/>
      </div>
      <div className="col-md-6">
        <h2>Qui sommes-nous ?</h2>
        <p>Créée en 2013 à Paris, NO MORE WASTE est une association humanitaire de lutte contre le gaspillage.</p>
        <p>Avec des bénévoles de confiance et des agences à l'international, No More Waste est l'un des leader dans la lutte contre le gaspillage.</p>
      </div>
    </div>
  );
}

export default AboutUs;
