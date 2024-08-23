import React from "react";
import Button from 'react-bootstrap/Button';
import { Link, useLocation,Navigate } from "react-router-dom";
import userProfile from './assets/images/user.png';
import { UserContext } from './userContext.jsx';
import { useContext } from "react";


export default function AccountNav() {
    const { user,ready } = useContext(UserContext);
    const pathName = useLocation();
    let subpage = pathName.pathname.split('/')[2];

    if (!ready) {
        return;
    }

    if (ready && !user) {
        return <Navigate to="/login" />;
    }


    function isAdmin(user) {
        if (user && user.isAdmin === 0) {
            return false;
        } else if (user && user.isAdmin === 1) {
            return true;
        }
        else {
            return false;
        }
        
    }
    function isVolunteer(user) {
        if (user && user.isVolunteer === 0) {
            return false;
        } else if (user && user.isVolunteer === 1) {
            return true;
        }
        else {  
            return false;
        }
    }
    

    function isMerchant(user) {
        if (user && user.isMerchant === 0) {
            return false;
        } else if (user && user.isMerchant === 1) {
            return true;
        }
        else {
            return false;
        }
    }
   

    if (subpage === undefined) {
        subpage = 'profile';
    }
    
    function linkClasses(type = null) {
        let classes = 'btn';
        if (type === subpage) {
            classes += ' bg-black text-white';
        }
        return classes;
    }
    return (
        <nav className="d-flex justify-content-center mt-3 gap-3 mb-4">
        <Link to={"/account"}>
            <Button variant={linkClasses("profile")}>
                <img className="icon-sm" src={userProfile} alt="icon description" stroke='currentColor'/>
                Mon profil
            </Button>
        </Link>
        {user && isVolunteer(user) && (
        <Link to={"/account/bookings"}>
        <Button variant={linkClasses("bookings")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-sm">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
        Mes réservations
        </Button>
        </Link>

        )}
        {user && isVolunteer(user) && (
        <Link to={"/account/services"}><Button variant={linkClasses("services")}>
            <svg className="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Mes services
        </Button></Link>
        )}
        {user && isMerchant(user) && (
        <Link to={"/account/merchant"}><Button variant={linkClasses("merchant")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-sm">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
            Mes produits
        </Button></Link>

        )}
                
            
        {user && isAdmin(user) && (

                <Link to={"/account/admin"}>
                    <Button variant={linkClasses("admin")}>
                        <svg className="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        </svg>
                        Admin
                    </Button>
                </Link>

            )}
    </nav>
    )
}