import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;

const OAuth2_client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
);
OAuth2_client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

export function sendMailUser(recipient, token) {
  const accessToken = OAuth2_client.getAccessToken();
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.USER_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const mailOPtions = {
    from: 'itwall.io@gmail.com',
    to: recipient,
    subject: `Message from ItWall( Activation Account ) `,
    html: `<h2>Your email is't active</h2><br><h3>Please click here for activating your account </h3> <h3><a href="http://localhost:3000/activation-account.html/${token}">Activating account</a></h3>`,
  };
  transport.sendMail(mailOPtions, function (error) {
    if (error) {
      console.log('error', error);
    }
  });
}
