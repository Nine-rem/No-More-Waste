import React from "react";
import Button from 'react-bootstrap/Button';
import { Link, useLocation,Navigate } from "react-router-dom";

import { UserContext } from './../userContext.jsx';
import { useContext } from "react";
import Form from 'react-bootstrap/Form';


export default function becomeVolunteerPage() {
    const { user,ready } = useContext(UserContext);
    
    if (!user) {
        return <Navigate to="/login" />;
    }


    return (
        <>
            <div>
                <h1>Devenir bénévole</h1>
                <p>Vous souhaitez devenir bénévole ?</p>
                <p>Remplissez ce formulaire et nous vous recontacterons dans les plus brefs délais.</p>
                <Form>
                    <div>
                        <p>Chez No More Waste nous proposons différents services qui nous permettent </p>
                    </div>
                    <div>
                        <h3>Quel service proposez-vous ? </h3>
                        <input type="text" required="required" />
                    </div>  
                    <Button variant="dark">Envoyer</Button>
                </Form>
            </div>
        
        </>
    )
}