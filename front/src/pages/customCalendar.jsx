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
        const response = await axios.get('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      const fetchSlots = async () => {
        try {
          const response = await axios.get('/timeslots', {
            params: { date: format(startOfDay(date), 'yyyy-MM-dd'), idService: selectedService }
          });
          setSlots(response.data);
        } catch (error) {
          console.error('Error fetching slots', error);
        }
      };
      fetchSlots();

      const fetchSpots = async () => {
        try {
          const response = await axios.get('/spots', {
            params: { month: date.getMonth() + 1, year: date.getFullYear(), idService: selectedService }
          });
          setSpots(response.data);
        } catch (error) {
          console.error('Error fetching spots', error);
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
    if (user && selectedSlot) { // Vérifier si l'utilisateur et le créneau sélectionné sont définis
      console.log('user.idUser:', user.idUser);  // Ajouter un console.log pour vérifier
      console.log('selectedSlot.idTimeslot:', selectedSlot.idTimeslot);  // Ajouter un console.log pour vérifier
      try {
        await axios.post('/reservations', { idUser: user.idUser, idTimeslot: selectedSlot.idTimeslot });
        alert('Reservation successful!');
        setSlots(slots.map(slot => slot.idTimeslot === selectedSlot.idTimeslot ? { ...slot, reserved: true } : slot));
        setSelectedSlot(null);
      } catch (error) {
        console.error('Error making reservation', error);
      }
    } else {
      alert('Please log in and select a timeslot to make a reservation');
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = format(startOfDay(date), 'yyyy-MM-dd');
      const daySpots = spots[dateString] || 0;
      return daySpots > 0 ? <div className="spots">{daySpots} SPOTS</div> : null;
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
      <h1>Reservation Calendar</h1>
      <div>
        <label>Select Service: </label>
        <select onChange={handleServiceSelect}>
          <option value="">Select a service</option>
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
      <h2>Available Slots on {format(date, 'EEE MMM dd yyyy')}</h2>
      <ul>
        {slots.filter(slot => !slot.reserved).map((slot, index) => (
          <li key={index} onClick={() => handleSlotSelect(slot)}>
            {slot.time}
          </li>
        ))}
      </ul>
      {selectedSlot && (
        <div>
          <h3>Selected Slot: {selectedSlot.time}</h3>
          <button onClick={handleReservation}>Reserve</button>
        </div>
      )}
    </div>
    </>
  );
};

export default CustomCalendar;
