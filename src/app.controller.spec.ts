import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { FirestoreService } from './services/firestore.service';
import { CacheService } from './services/cache.service';
import { PreferencesDto } from './dto/preferences.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

describe('AppController', () => {
  let appController: AppController;
  let firestoreService: FirestoreService;
  let cacheService: CacheService;
  let app: admin.app.App;
  const privateKey = process.env.GOOGLE_APPLICATION_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_APPLICATION_CLIENT_EMAIL;

  beforeAll(async () => {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'hostelworld-assignment',
        privateKey,
        clientEmail,
      }),
    });
  });

  afterAll(async () => {
    await app.delete();
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [FirestoreService, CacheService],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    firestoreService = moduleRef.get<FirestoreService>(FirestoreService);
    cacheService = moduleRef.get<CacheService>(CacheService);
  });

  describe('savePreferences', () => {
    it('should save the preferences and return "Preferences saved"', async () => {
      const userId = 'test-user-id';
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };

      jest.spyOn(cacheService, 'has').mockReturnValueOnce(false);
      jest.spyOn(cacheService, 'set').mockReturnValueOnce();
      jest.spyOn(firestoreService, 'savePreferences').mockResolvedValueOnce();

      const result = await appController.savePreferences(
        preferencesDto,
        userId,
      );

      expect(result).toBe('Preferences saved');
      expect(cacheService.has).toHaveBeenCalledWith(userId);
      expect(cacheService.set).toHaveBeenCalledWith(userId, true);
      expect(firestoreService.savePreferences).toHaveBeenCalledWith(
        userId,
        preferencesDto,
      );
    });

    it('should throw an HttpException with status code 400 if the userId is not provided', async () => {
      const userId = '';
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };

      try {
        await appController.savePreferences(preferencesDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Incorrect userId');
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an HttpException with status code 400 if the request data is invalid', async () => {
      const userId = 'test-user-id';
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'invalid',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };

      try {
        await appController.savePreferences(preferencesDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Bad request');
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an HttpException with status code 409 if the request has already been processed', async () => {
      const userId = 'test-user-id';
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };

      jest.spyOn(cacheService, 'has').mockReturnValueOnce(true);

      try {
        await appController.savePreferences(preferencesDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Duplicate request');
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should throw an HttpException with status code 500 if an error occurs during processing', async () => {
      const userId = 'test-user-id';
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };

      jest.spyOn(cacheService, 'has').mockReturnValueOnce(false);
      jest
        .spyOn(firestoreService, 'savePreferences')
        .mockRejectedValueOnce(new Error());

      try {
        await appController.savePreferences(preferencesDto, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'An error occurred while processing your request',
        );
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
