import React, { useContext } from 'react';
import axios from "axios";
import { Route, Routes } from "react-router-dom";

import { UserContext } from '../userContext.jsx';

import AccountNav from "../accountNav.jsx";


function servicesPage() {
    const { user } = useContext(UserContext);


    return (
        <div>
        <AccountNav/>
        <h1>Services</h1>
        <p>Vous pouvez consulter ici vos services</p>

        </div>
    );
};

export default servicesPage;