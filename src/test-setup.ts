import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.GOOGLE_APPLICATION_PRIVATE_KEY;
const clientEmail = process.env.GOOGLE_APPLICATION_CLIENT_EMAIL;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'hostelworld-assignment',
    privateKey,
    clientEmail,
  }),
});
export default admin;
