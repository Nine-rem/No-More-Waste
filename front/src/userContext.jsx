import { createContext, useEffect, useState } from "react";
import React from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
            axios.get('/api/account', { withCredentials: true })
            .then((response) => {
                const data = response.data;
                //console.log(data);
                if (data) {
                    const userDetails = {
                        idUser: data.idUser,
                        email: data.email,
                        isAdmin: data.isAdmin,
                        isMerchant: data.isMerchant,
                        isVolunteer: data.isVolunteer,
                        firstname: data.firstname,
                        lastname: data.lastname
                        


                    };
                    setUser(userDetails);  
                } else {
                    setUser(null);  
                }
                setReady(true);  
            })
            .catch((error) => {
                console.error("Erreur lors de la récupération du profil :", error);
                setReady(true); 
            });
    }, []);

    const logout = async () => {
        try {
            await axios.post('/api/logout', {}, { withCredentials: true });
            setUser(null); 
            setReady(false); 
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, ready, logout }}>
            {children}
        </UserContext.Provider>
    );
}