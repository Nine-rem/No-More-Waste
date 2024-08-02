import React from "react";
import { Link } from "react-router-dom";

export default function LegalPage() {
    return (
    <>
     {/* Hero  */}
    <div id="hero-principal-image" className="px-4 py-5 d-flex justify-content-center align-items-center hero-secondary hero-position">
        <div className="py-5 box-margin-left">
            <h1 className="display-5 fw-bold">Mentions légales</h1>
        </div>
    </div>

     {/* Bloc mentions légales  */}
    <div id="legal" className="box lightgrey-box row vertical-align">
        <div className="accordion" id="accordionPanelsStayOpenExample">
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
                    Présentation du site
                </button>
                </h2>
                <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
                    Conditions générales d'utilisation du site et des services proposés
                </button>
                </h2>
                <div id="panelsStayOpen-collapseTwo" className="accordion-collapse collapse">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
                    Description des services fournis
                </button>
                </h2>
                <div id="panelsStayOpen-collapseThree" className="accordion-collapse collapse ">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFour" aria-expanded="false" aria-controls="panelsStayOpen-collapseFour">
                    Limitations contractuelles sur les données techniques
                </button>
                </h2>
                <div id="panelsStayOpen-collapseFour" className="accordion-collapse collapse">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseFive" aria-expanded="false" aria-controls="panelsStayOpen-collapseFive">
                    Propriété intellectuelle et contrefaçons
                </button>
                </h2>
                <div id="panelsStayOpen-collapseFive" className="accordion-collapse collapse">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
            <div className="accordion-item">
                <h2 className="accordion-header">
                <button className="accordion-button text-up collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseSix" aria-expanded="false" aria-controls="panelsStayOpen-collapseSix">
                    Limitations de responsabilité
                </button>
                </h2>
                <div id="panelsStayOpen-collapseSix" className="accordion-collapse collapse">
                    <div className="accordion-body">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac ipsum eget massa euismod tristique. Quisque sit amet venenatis dolor, dignissim hendrerit erat. Nam quis pellentesque mauris, imperdiet elementum metus. Vivamus sed eros at neque consectetur condimentum. Mauris vel lacus at purus faucibus efficitur vitae sit amet enim. Quisque ante libero, faucibus ut imperdiet quis, fermentum eget nunc. Sed convallis iaculis mattis. Nulla gravida ipsum neque.</p>
                        <p>Morbi erat risus, ullamcorper ac tortor egestas, tincidunt venenatis turpis. Praesent interdum metus a dui suscipit pulvinar. Mauris et augue mollis, porttitor orci vitae, placerat mi. Nam imperdiet ex non ornare venenatis. Proin condimentum pharetra turpis a condimentum. Nulla sit amet nisi tortor.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>   

    </>
    );
}