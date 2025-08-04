const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,          // implicit TLS port
  secure: true,       // must be true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail app password without spaces
  },
});

// Verify SMTP connection at startup
transporter.verify((err, success) => {
  if (err) {
    console.error(' SMTP transporter verification failed:', err);
  } else {
    console.log(' SMTP transporter is ready to send emails');
  }
});

async function sendBookingEmails({ booking }) {
  const userMail = {
    from: `"Reservation" <${process.env.SMTP_USER}>`,
    to: booking.userEmail,
    subject: `Booking Confirmed: Table ${booking.table_id}`,
    text: `
Hi ${booking.userName},

Your booking is confirmed:
- Table: ${booking.table_id}
- Time: ${booking.timeSlot}
- Booking ID: ${booking._id}

Thank you for booking with us.
    `.trim(),
  };

  const adminMail = {
    from: `"Reservation System" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking: Table ${booking.table_id}`,
    text: `
New booking details:
- User: ${booking.userName} (${booking.userEmail})
- Table: ${booking.table_id}
- Time: ${booking.timeSlot}
- Booking ID: ${booking._id}
    `.trim(),
  };

  try {
    await transporter.sendMail(userMail);
    console.log(` Email sent to user ${booking.userEmail}`);
  } catch (e) {
    console.error(' Failed to send email to user:', e);
  }

  try {
    await transporter.sendMail(adminMail);
    console.log(` Email sent to admin ${process.env.ADMIN_EMAIL}`);
  } catch (e) {
    console.error(' Failed to send email to admin:', e);
  }
}

module.exports = sendBookingEmails;
