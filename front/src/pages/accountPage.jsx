import React, { useContext } from 'react';
import { UserContext } from '../userContext.jsx';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AccountNav from '../accountNav.jsx';
import '../style/accountNav.css';
import Button from 'react-bootstrap/Button';

export default function ProfilePage() {
    const { ready, user, logout } = useContext(UserContext);
    let { subpage } = useParams();
    const navigate = useNavigate();

    if (!subpage) {
        subpage = 'profile';
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!ready) {
        return <div>Loading...</div>;
    }

    if (ready && !user) {
        return <Navigate to="/login" />;
    }

    function isVolunteer(user) {
        return user && user.isVolunteer === 1;
    }
    function isMerchant(user) {
        return user && user.isMerchant === 1;
    }

    return (
        console.log(user),
        <>
            <div>
                <AccountNav />
                {subpage === 'profile' && (
                    <div className='text-center max-w-lg mx-auto'>
                        Bonjour {user.firstname} {user.lastname} !<br />
                        <button onClick={handleLogout} type="button" className="btn btn-dark max-w-sm mt-2">Se déconnecter</button>
                        <Link to={`/account/edit/${user.idUser}`}>
                            <button type="button" className="btn btn-dark max-w-sm mt-2">Modifier mon profil</button>
                        </Link>
                        {user && isMerchant(user) && (
                        <Link to='/account/subscription'>
                            <Button variant="dark" className="max-w-sm mt-2">S'abonner</Button>
                        </Link>
                        )}
                    </div>
                )}
            </div>
            {user && !isVolunteer(user) && !isMerchant(user) && (
                <>
                <Link to='/becomeVolunteer'>
                    <Button variant="dark">Devenir Bénévole</Button>
                </Link>
            
                <Link to='/becomeMerchant'>
                    <Button variant="dark">Devenir Commerçant</Button>
                </Link>
                </>
            )}
            
        </>
    );
}
