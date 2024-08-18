import React from 'react';
import { Link } from 'react-router-dom';

//"window.location.href='stay-all.php'"
function Hero() {
  return (
    <>
    <div>
      <div id="hero-principal-image" className="px-4 py-5 d-flex justify-content-start align-items-center hero-primary hero-position">
          <div className="py-5 box-margin-left">
              <h1 className="display-5 fw-bold">Association humanitaire de lutte contre le gaspillage</h1>
              <p className="fs-5 mb-4">Participez au changement</p>
              <Link to = "/register"><button className="btn btn-dark btn-hover-brown" type="button">Devenir bénévole</button> </Link> 
          </div>
      </div>
    </div>
    </>
  );
}

export default Hero;
