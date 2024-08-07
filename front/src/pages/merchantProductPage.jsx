import React from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import AccountNav from "../accountNav.jsx";

function merchantProductPage() {
    return (
        <div>
            <AccountNav/>
            <h1>Merchant</h1>
            <p>Vous pouvez consulter ici vos produits</p>

        
        </div>
    );
}

export default merchantProductPage;