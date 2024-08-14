import React, { useState, useEffect, useContext } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './../style/calendar.css'; // Créez ce fichier pour les styles personnalisés
import { UserContext } from '../userContext';
import { format, isBefore, startOfDay } from 'date-fns';
import AccountNav from '../accountNav';

const CustomCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [spots, setSpots] = useState({});
  const { user } = useContext(UserContext); // Utiliser le contexte utilisateur

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services'); // Mise à jour de l'URL
        setServices(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      const fetchSlots = async () => {
        try {
          const response = await axios.get('/api/services/timeslots', { // Mise à jour de l'URL
            params: { date: format(startOfDay(date), 'yyyy-MM-dd'), idService: selectedService }
          });
          setSlots(response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des créneaux horaires', error);
        }
      };
      fetchSlots();

      const fetchSpots = async () => {
        try {
          const response = await axios.get('/api/services/spots', { // Mise à jour de l'URL
            params: { month: date.getMonth() + 1, year: date.getFullYear(), idService: selectedService }
          });
          setSpots(response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des disponibilités', error);
        }
      };
      fetchSpots();
    }
  }, [date, selectedService]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot(null);
  };

  const handleServiceSelect = (event) => {
    setSelectedService(event.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleReservation = async () => {
    if (user && selectedSlot) {
      try {
        await axios.post('/api/users/reserve', { // Mise à jour de l'URL
          idUser: user.idUser, 
          idTimeslot: selectedSlot.idTimeslot 
        });
        alert('Réservation réussie !');
        setSlots(slots.map(slot => slot.idTimeslot === selectedSlot.idTimeslot ? { ...slot, reserved: true } : slot));
        setSelectedSlot(null);
      } catch (error) {
        console.error('Erreur lors de la réservation', error);
      }
    } else {
      alert('Veuillez vous connecter et sélectionner un créneau pour faire une réservation');
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(startOfDay(date), 'yyyy-MM-dd');
      const daySpots = spots[dateString] || 0;
      return daySpots > 0 ? <div className="spots">{daySpots} Disponible</div> : null;
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    // Disable tiles before today
    if (view === 'month') {
      return isBefore(startOfDay(date), startOfDay(new Date()));
    }
    return false;
  };

  return (
    <>
    <AccountNav/>
    <div className="CustomCalendar">
      <h1>Calendrier de Réservations</h1>
      <div>
        <label>Sélectionnez un service: </label>
        <select onChange={handleServiceSelect}>
          <option value="">Sélection du service</option>
          {services.map(service => (
            <option key={service.idService} value={service.idService}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileContent={tileContent}
        tileDisabled={tileDisabled}
      />
      <h2>Créneaux disponible pour le {format(date, 'EEE MMM dd yyyy')}</h2>
      <ul>
        {slots.filter(slot => !slot.reserved).map((slot, index) => (
          <li key={index} onClick={() => handleSlotSelect(slot)}>
            {slot.time}
          </li>
        ))}
      </ul>
      {selectedSlot && (
        <div>
          <h3>Créneau sélectionné: {selectedSlot.time}</h3>
          <button onClick={handleReservation}>Réserver</button>
        </div>
      )}
    </div>
    </>
  );
};

export default CustomCalendar;
