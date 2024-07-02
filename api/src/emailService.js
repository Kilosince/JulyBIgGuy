import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: "info@theflyingpot.org",
    pass: "sparklingclementine", // Ensure this is the correct password
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false, // This should be set based on security requirements
  }
});

const sendVerificationEmail = async (email, code) => {
  let mailOptions = {
    from: '"The Flying Pot" <info@theflyingpot.org>', // Updated with display name
    to: email,
    subject: 'Email Verification',
    text: `Your verification code is: ${code}`,
    html: `<b>Your verification code is: ${code}</b>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
  }
};

const sendPurchaseEmail = async (email, storeName, ccName, cartTotal, items, timestamp) => {
  if (!Array.isArray(items)) {
    console.error('Items is not an array:', items);
    return;
  }

  items.forEach((item, index) => {
    if (!item.itemName || !item.price || !item.quantity) {
      console.error(`Item at index ${index} is missing itemName, price, or quantity:`, item);
    }
  });

  let itemDetails = items.map(item => `<li>${item.itemName}: $${item.price} (Quantity: ${item.quantity})</li>`).join('');

  let mailOptions = {
    from: '"The Flying Pot" <info@theflyingpot.org>',
    to: email,
    subject: 'Thank You for Your Purchase!',
    html: `
      <h1>Thank You for Your Purchase!</h1>
      <p>Store: ${storeName}</p>
      <p>Name: ${ccName}</p>
      <p>Total: $${cartTotal}</p>
      <p>Time of Purchase: ${timestamp}</p>
      <ul>${itemDetails}</ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Purchase email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
  }
};

export { sendVerificationEmail, sendPurchaseEmail };
