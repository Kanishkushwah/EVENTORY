/**
 * Generate HTML email template for booking confirmation
 */
export function getEmailTemplate(booking) {
     return `
 <!DOCTYPE html>
 <html>
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <style>
         body {
             font-family: 'Arial', sans-serif;
             line-height: 1.6;
             color: #333;
             max-width: 600px;
             margin: 0 auto;
             padding: 20px;
         }
         .header {
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             color: white;
             padding: 30px;
             text-align: center;
             border-radius: 10px 10px 0 0;
         }
         .header h1 {
             margin: 0;
             font-size: 28px;
         }
         .content {
             background: #ffffff;
             padding: 30px;
             border: 1px solid #e5e7eb;
         }
         .ticket-box {
             background: #f9fafb;
             border-left: 4px solid #6B46C1;
             padding: 20px;
             margin: 20px 0;
         }
         .detail-row {
             margin: 12px 0;
             padding: 8px 0;
             border-bottom: 1px solid #e5e7eb;
         }
         .label {
             color: #6b7280;
             font-size: 12px;
             text-transform: uppercase;
             letter-spacing: 0.5px;
         }
         .value {
             color: #1f2937;
             font-size: 16px;
             font-weight: 600;
             margin-top: 4px;
         }
         .reference {
             background: #6B46C1;
             color: white;
             padding: 15px;
             text-align: center;
             border-radius: 8px;
             font-size: 24px;
             font-weight: bold;
             letter-spacing: 2px;
             margin: 20px 0;
         }
         .footer {
             background: #f3f4f6;
             padding: 20px;
             text-align: center;
             font-size: 12px;
             color: #6b7280;
             border-radius: 0 0 10px 10px;
         }
         .button {
             display: inline-block;
             background: #6B46C1;
             color: white;
             padding: 12px 30px;
             text-decoration: none;
             border-radius: 6px;
             margin: 20px 0;
             font-weight: 600;
         }
     </style>
 </head>
 <body>
     <div class="header">
         <h1>🎟️ Booking Confirmed!</h1>
         <p style="margin: 10px 0 0 0; opacity: 0.9;">Your ticket is ready</p>
     </div>
     
     <div class="content">
         <p>Hi there! 👋</p>
         <p>Great news! Your booking for <strong>${booking.event_title}</strong> has been confirmed.</p>
         
         <div class="reference">
             ${booking.reference}
         </div>
         
         <div class="ticket-box">
             <div class="detail-row">
                 <div class="label">📅 Event Date</div>
                 <div class="value">${booking.event_date}</div>
             </div>
             
             <div class="detail-row">
                 <div class="label">🕐 Time</div>
                 <div class="value">${booking.event_time}</div>
             </div>
             
             <div class="detail-row">
                 <div class="label">📍 Venue</div>
                 <div class="value">${booking.venue}</div>
             </div>
             
             <div class="detail-row">
                 <div class="label">💺 Seats</div>
                 <div class="value">${booking.seats.join(', ')}</div>
             </div>
             
             <div class="detail-row" style="border-bottom: none;">
                 <div class="label">💰 Amount Paid</div>
                 <div class="value" style="color: #10B981;">₹${booking.amount_paid}</div>
             </div>
         </div>
         
         <p><strong>Your ticket is attached as a PDF.</strong> Please download and present it at the venue entrance.</p>
         
         <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:support@eventory.com">support@eventory.com</a></p>
     </div>
     
     <div class="footer">
         <p><strong>Eventory</strong> - Your Event Booking Partner</p>
         <p>This is an automated email. Please do not reply.</p>
         <p style="margin-top: 10px;">
             <a href="https://eventory.com" style="color: #6B46C1; text-decoration: none;">Visit Website</a> | 
             <a href="https://eventory.com/support" style="color: #6B46C1; text-decoration: none;">Support</a>
         </p>
     </div>
 </body>
 </html>
     `;
 }