import React from 'react';
import axios from 'axios';
import { Route, Routes } from 'react-router-dom';

import { UserContextProvider } from './userContext.jsx';
import IndexPage from './pages/indexPage.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import QuotationPage from './pages/quotationPage.jsx';
import LegalPage from './pages/legalPage.jsx';
import CookiesPage from './pages/cookiesPage.jsx';
import ServiceTermsPage from './pages/serviceTermsPage.jsx';
import ContactPage from './pages/contactPage.jsx';
import AccountPage from './pages/accountPage.jsx';
import ServicesPage from './pages/servicesPage.jsx';
import BecomeVolunteerPage from './pages/becomeVolunteerPage.jsx';
import CalendarPage from './pages/customCalendar.jsx';
import MerchantPage from './pages/merchantPage.jsx';
import MerchantProductPage from './pages/merchantProductPage.jsx';
import MerchantAddProductPage from './pages/merchantAddProductPage.jsx';
import AdminPage from './pages/adminPage.jsx';
import UsersPage from './pages/usersPage.jsx';
import Layout from './layout.jsx';
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;
function App() {
  
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path='/account/services' element={<ServicesPage />} />

          <Route path="/account/becomeVolunteer" element={<BecomeVolunteerPage />} />

          <Route path ='/account/merchant' element={<MerchantPage />} />
          <Route path="/account/merchant/products" element={<MerchantProductPage />} />
          <Route path="/account/merchant/addProduct" element={<MerchantAddProductPage />} />

          <Route path="/account/admin" element={<AdminPage />} />
          <Route path="/account/admin/users" element={<UsersPage />} />



          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/serviceTerms" element={<ServiceTermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path='calendar' element={<CalendarPage />} />
        </Route>
      </Routes>
      </UserContextProvider>

  );
}

export default App;