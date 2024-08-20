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

import AllServicesPage from './pages/allServicesPage.jsx';
import AllProductsPage from './pages/allProductsPage.jsx';
import ProductPage from './pages/productPage.jsx';


import AccountPage from './pages/accountPage.jsx';
import EditUserPage from './pages/editUserPage.jsx';


import ServicesPage from './pages/servicesPage.jsx';
import CalendarPage from './pages/customCalendar.jsx';

import BecomeVolunteerPage from './pages/becomeVolunteerPage.jsx';
import MyservicesPage from './pages/myServicesPage.jsx';
import AddSlotsPage from './pages/addSlotsPage.jsx';
import ViewSlotsPage from './pages/viewSlotsPage.jsx';
import EditSlotsPage from './pages/editSlotsPage.jsx';


import VolunteerApplyPage from './pages/volunteerApplyPage.jsx';



import MerchantPage from './pages/merchantPage.jsx';
import BecomeMerchantPage from './pages/becomeMerchantPage.jsx';
import MerchantProductPage from './pages/merchantProductPage.jsx';
import MerchantAddProductPage from './pages/merchantAddProductPage.jsx';
import MerchantEditProductPage from './pages/merchantEditProductPage.jsx';

import AdminPage from './pages/adminPage.jsx';
import UsersPage from './pages/usersPage.jsx';
import AdminEditSubscriptionPage from './pages/adminEditSubscription.jsx';
import AdminSubscriptionPage from './pages/adminSubscriptionPage.jsx';
import AdminCreateSubscriptionPage from './pages/adminCreateSubscriptionPage.jsx';
import AdminEditUserPage from './pages/adminEditUserPage.jsx';

import NotFoundPage from './pages/notFoundPage.jsx';
import Layout from './layout.jsx';
import SubscriptionPage from './pages/subscriptionPage.jsx';
import SuccessPage from './pages/successPage.jsx';
import CancelledPage from './pages/cancelledPage.jsx';
import AdminManageApplicationsPage from './pages/AdminManageApplicationsPage.jsx';
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
axios.defaults.withCredentials = true;
function App() {

  return (
    console.log(axios.defaults.baseURL),
    
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/services/all" element={<AllServicesPage />} />
          <Route path="/products/all" element={<AllProductsPage />} />
          <Route path="/products/:idProduct" element={< ProductPage />} />

          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/edit/:id" element={<EditUserPage />} />
          <Route path="/account/subscription" element={<SubscriptionPage />} />

          <Route path='/account/services' element={<ServicesPage />} />
          <Route path='/account/volunteer/myServices' element={<MyservicesPage />} />
          <Route path="/account/volunteer/services/:idService/slots/add" element={<AddSlotsPage />}/>
          <Route path='/account/volunteer/services/:idService/slots/view' element={<ViewSlotsPage />} />
          <Route path='/account/volunteer/services/:idService/slots/edit' element={<EditSlotsPage />} />
          <Route path='/account/volunteer/services' element={<VolunteerApplyPage />} />
 
          <Route path="/becomeVolunteer" element={<BecomeVolunteerPage />} />

          <Route path ='/account/merchant' element={<MerchantPage />} />
          <Route path="/becomeMerchant" element={<BecomeMerchantPage />} />
          
          <Route path="/account/merchant/products" element={<MerchantProductPage />} />
          <Route path="/account/merchant/addProduct" element={<MerchantAddProductPage />} />
          <Route path="/account/merchant/editProduct/:productId" element={<MerchantEditProductPage />} />


          <Route path="/account/admin" element={<AdminPage />} />
          <Route path="/account/admin/users" element={<UsersPage />} />
          <Route path="/account/admin/users/:id/edit" element={<AdminEditUserPage/>} />
          <Route path="/account/admin/subscriptions/:id/edit" element={<AdminEditSubscriptionPage />} />
          <Route path='/account/admin/subscriptions' element={<AdminSubscriptionPage />} />
          <Route path='/account/admin/subscription/create' element={<AdminCreateSubscriptionPage />} />
          <Route path="/account/admin/volunteer/applications" element={<AdminManageApplicationsPage />} />
          

          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/serviceTerms" element={<ServiceTermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path='calendar' element={<CalendarPage />} />


          <Route path="/success" element={<SuccessPage />} />
          <Route path="/account?canceled=true" element={<CancelledPage />} /> 
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </UserContextProvider>

);
}

export default App;