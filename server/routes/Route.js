import express from 'express'
import  {registration, login, book, available_slots, userregistration, userlogin, getHotelDashboard, forgotpassword, updatepassword,  hoteldetaill, pendingbooking, confirmbooking, cancelbooking, completebooking, submitFeedback, getHotelFeedback, trackEvent, logout}  from '../controller/hotelcontroller.js';
import registrationotp from '../controller/RegistrationotpController.js';
import forgetotp from '../controller/ForgetotpController.js';
import { getUser } from '../middleware/token.js';

const route = express.Router();

route.post('/registration', registration);
route.post('/login', login);
route.post('/book', getUser,book);
route.get('/available_slots',available_slots)
route.get('/hoteldashboard',getHotelDashboard)
route.post('/hoteldetail', hoteldetaill);
route.post('/')
route.put('/pendingbooking/:id', pendingbooking);
route.put('/confirmbooking/:id', confirmbooking);
route.put('/cancelbooking/:id', cancelbooking);
route.put('/completebooking/:id', completebooking);
route.post('/submitFeedback', submitFeedback);
route.get('/getHotelFeedback/:hotelname', getHotelFeedback);




route.post('/userregistration', userregistration)
route.post('/userlogin', userlogin);
route.post('/logout', logout);



route.post('/forgetotp', forgetotp);
route.post('/registrationotp', registrationotp);
route.post('/forgotpassword', forgotpassword);
route.put('/updatepassword', updatepassword);
route.post("/trackevent", trackEvent);


export default route;