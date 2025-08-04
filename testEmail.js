require('dotenv').config();
const sendBookingEmails = require('./utils/emailSender');

async function test() {
  const dummyBooking = {
    _id: 'test123',
    table_id: '1',
    timeSlot: '2025-08-16T19:00',
    userEmail: 'runweztcheta@gmail.com', // change to your real test recipient
    userName: 'Test User',
  };
  await sendBookingEmails({ booking: dummyBooking });
  console.log('Test email attempted');
}

test().catch(console.error);
