exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const {
    firstName,
    lastName,
    phone,
    email,
    address,
    services,
    addons,
    date,
    time,
    total,
    notes
  } = JSON.parse(event.body);

  // Basic validation
  if (!firstName || !email || !services || !date || !time) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Build the email HTML
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf9f7; padding: 0;">
      
      <!-- Header -->
      <div style="background: #0f1b2d; padding: 24px 32px; text-align: center;">
        <h1 style="color: #daa06d; font-size: 18px; margin: 0; letter-spacing: 2px;">HCC — NEW BOOKING</h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <h2 style="color: #0f1b2d; font-size: 22px; margin: 0 0 4px;">New Appointment Booked</h2>
        <p style="color: #999; font-size: 14px; margin: 0 0 24px;">A customer just scheduled a cleaning through your website.</p>

        <!-- Customer Info -->
        <div style="background: #ffffff; border: 1px solid #e4e0da; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 12px;">Customer Details</h3>
          <table style="width: 100%; font-size: 14px; color: #2c2c2c;">
            <tr><td style="padding: 6px 0; color: #999; width: 100px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Phone</td><td style="padding: 6px 0; font-weight: 600;"><a href="tel:${phone}" style="color: #c07a3a; text-decoration: none;">${phone}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Email</td><td style="padding: 6px 0; font-weight: 600;"><a href="mailto:${email}" style="color: #c07a3a; text-decoration: none;">${email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Address</td><td style="padding: 6px 0; font-weight: 600;">${address}</td></tr>
          </table>
        </div>

        <!-- Appointment -->
        <div style="background: #ffffff; border: 1px solid #e4e0da; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 12px;">Appointment</h3>
          <table style="width: 100%; font-size: 14px; color: #2c2c2c;">
            <tr><td style="padding: 6px 0; color: #999; width: 100px;">Date</td><td style="padding: 6px 0; font-weight: 600;">${date}</td></tr>
            <tr><td style="padding: 6px 0; color: #999;">Time</td><td style="padding: 6px 0; font-weight: 600;">${time}</td></tr>
          </table>
        </div>

        <!-- Services -->
        <div style="background: #ffffff; border: 1px solid #e4e0da; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 12px;">Services</h3>
          <p style="font-size: 14px; color: #2c2c2c; margin: 0; font-weight: 600;">${services.join(', ')}</p>
          ${addons && addons.length > 0 ? `
            <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 16px 0 8px;">Add-ons</h3>
            <p style="font-size: 14px; color: #2c2c2c; margin: 0;">${addons.join(', ')}</p>
          ` : ''}
        </div>

        ${notes ? `
        <div style="background: #ffffff; border: 1px solid #e4e0da; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin: 0 0 8px;">Notes</h3>
          <p style="font-size: 14px; color: #2c2c2c; margin: 0;">${notes}</p>
        </div>
        ` : ''}

        <!-- Total -->
        <div style="background: #0f1b2d; border-radius: 8px; padding: 20px; text-align: center;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Estimated Total</span>
          <div style="font-size: 32px; font-weight: 700; color: #daa06d; margin-top: 4px;">$${total}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; text-align: center; border-top: 1px solid #e4e0da;">
        <p style="font-size: 12px; color: #999; margin: 0;">Houston Carpet Cleaning (HCC) — Automated Booking Notification</p>
      </div>
    </div>
  `;

  // Mailgun API
  const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
  const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

  const formData = new URLSearchParams();
  formData.append('from', `HCC Bookings <bookings@${MAILGUN_DOMAIN}>`);
  formData.append('to', 'houstoncarpetcleaning3@gmail.com');
  formData.append('to', 'SECOND_EMAIL_HERE@gmail.com');
  formData.append('subject', `New HCC Booking — ${firstName} ${lastName} on ${date}`);
  formData.append('html', emailHtml);

  try {
    const credentials = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Mailgun error:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email', details: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id })
    };
  } catch (err) {
    console.error('Email send error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
