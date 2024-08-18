import React, { useContext } from 'react';
import axios from "axios";
import { Link, Route, Routes } from "react-router-dom";

import { UserContext } from '../userContext.jsx';

import AccountNav from "../accountNav.jsx";


function servicesPage() {
    const { user } = useContext(UserContext);


    return (
        <div>
        <AccountNav/>
        <h1>Services</h1>
        <p>Vous pouvez consulter ici vos services</p>
        <Link to="/account/volunteer/services">
            <button type="button" className="btn btn-primary">Proposer un service </button>
        </Link>

        </div>
    );
};

export default servicesPage;