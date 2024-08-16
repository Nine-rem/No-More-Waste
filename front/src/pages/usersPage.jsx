import React, { useContext, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AccountNav from "../accountNav.jsx";
import { UserContext } from "../userContext.jsx";
import axios from "axios";

function UsersPage() {
    const { user, ready } = useContext(UserContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (ready) {
            axios.get('/api/users')
                .then(response => {
                    setUsers(response.data);
                })
                .catch(error => {
                    console.error("There was an error fetching the users!", error);
                });
        }
    }, [ready]);

    const handleBanUser = (userId) => {
        axios.patch(`/api/users/${userId}/ban`)
            .then(response => {
                const updatedStatus = response.data.isBanned;
                setUsers(users.map(user => 
                    user.idUser === userId ? { ...user, isBanned: updatedStatus } : user
                ));
            })
            .catch(error => {
                console.error("There was an error banning the user!", error);
            });
    };

    if (!ready) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div>
            <AccountNav />
            <h1>Users</h1>
            <p>Vous pouvez consulter ici vos utilisateurs</p>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.idUser}>
                            <td>{user.idUser}</td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>
                                <Link to={`/account/admin/users/${user.idUser}/edit`}>
                                    <Button variant="warning">Edit</Button>
                                </Link>
                                <Button 
                                    variant={user.isBanned ? "success" : "danger"} 
                                    onClick={() => handleBanUser(user.idUser)}
                                >
                                    {user.isBanned ? "Unban" : "Ban"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersPage;
