import {React, useContext} from "react";
import axios from "axios";
import { Link, Route, Routes } from "react-router-dom";
import { UserContext } from "../userContext.jsx";
import AccountNav from "../accountNav.jsx";
import { Button } from "react-bootstrap";


function merchantPage() {
    const { user } = useContext(UserContext);

    return (
        <div>
            <AccountNav/>
            <h1>Merchant</h1>
            <p>Vous pouvez consulter ici vos produits</p>
            <Link to="/account/merchant/products">
                <Button variant="primary">Liste des produits</Button>
            </Link>
            <Link to="/account/merchant/addProduct">
                <Button variant="primary">Ajouter un produit</Button>
            </Link>
        </div>
    );
}

export default merchantPage;