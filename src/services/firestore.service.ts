import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { PreferencesDto } from '../dto/preferences.dto';

dotenv.config();

@Injectable()
export class FirestoreService {
  private readonly db: admin.firestore.Firestore;

  constructor() {
    const privateKey = process.env.GOOGLE_APPLICATION_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_APPLICATION_CLIENT_EMAIL;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'hostelworld-assignment',
        privateKey,
        clientEmail,
      }),
    });
    this.db = admin.firestore();
    console.log('database init');
  }
  async savePreferences(
    userId: string,
    preferencesDto: PreferencesDto,
  ): Promise<void> {
    // Create a document reference for the user's preferences
    const preferencesRef = this.db
      .collection('users')
      .doc(userId)
      .collection('preferences')
      .doc('userPreferences');

    // Save the preferences data to Firestore
    await preferencesRef.set(JSON.parse(JSON.stringify(preferencesDto)), {
      merge: true,
    });
  }
}
