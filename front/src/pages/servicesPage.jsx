import React, { useContext } from 'react';
import axios from "axios";
import { Link, Route, Routes } from "react-router-dom";

import { UserContext } from '../userContext.jsx';

import AccountNav from "../accountNav.jsx";
import { Button } from "react-bootstrap";


function servicesPage() {
    const { user } = useContext(UserContext);


    return (
        <div>
        <AccountNav/>
        <h1>Services</h1>
        <p>Vous pouvez consulter ici vos services</p>
        <Link to="/account/volunteer/services">
            <Button variant="dark">Postuler pour un service</Button>
        </Link>
        <Link to="/account/volunteer/myServices">
            <Button variant="dark">Mes services</Button>
        </Link>

        </div>
    );
};

export default servicesPage;