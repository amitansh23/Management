import express from 'express'
import  {registration, login, book, available_slots, userregistration, userlogin, getHotelDashboard, forgotpassword, updatepassword,  hoteldetaill}  from '../controller/hotelcontroller.js';
import registrationotp from '../controller/RegistrationotpController.js';
import forgetotp from '../controller/ForgetotpController.js';

const route = express.Router();

route.post('/registration', registration);
route.post('/login', login);
route.post('/book', book);
route.get('/available_slots',available_slots)
route.get('/hoteldashboard',getHotelDashboard)
route.post('/hoteldetail', hoteldetaill);



route.post('/userregistration', userregistration)
route.post('/userlogin', userlogin);



route.post('/forgetotp', forgetotp);
route.post('/registrationotp', registrationotp);
route.post('/forgotpassword', forgotpassword);
route.put('/updatepassword', updatepassword);


export default route;