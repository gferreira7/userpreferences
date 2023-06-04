import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppController } from '../src/app.controller';
import { FirestoreService } from '../src/services/firestore.service';
import { CacheService } from '../src/services/cache.service';
import { PreferencesDto } from '../src/dto/preferences.dto';

describe('AppController', () => {
  let app: INestApplication;
  let firestoreService: FirestoreService;
  let cacheService: CacheService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [FirestoreService, CacheService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    firestoreService = moduleRef.get<FirestoreService>(FirestoreService);
    cacheService = moduleRef.get<CacheService>(CacheService);
    cacheService['cache'] = {};
  });

  afterAll(async () => {
    await app.close();
  });

  describe('savePreferences', () => {
    it('should save the preferences and return 201', async () => {
      const preferencesDto: PreferencesDto = {
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };
      const userId = 'test-user-id';

      // mock FirestoreService savePreferences method
      jest.spyOn(firestoreService, 'savePreferences').mockResolvedValueOnce();

      // mock CacheService has and set methods
      jest.spyOn(cacheService, 'has').mockReturnValueOnce(false);
      jest.spyOn(cacheService, 'set').mockReturnValueOnce();

      // make HTTP request
      const response = await request(app.getHttpServer())
        .post('/v1/user/preferences')
        .set('user-id', userId)
        .send(preferencesDto);

      // assert response
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.text).toBe('Preferences saved');

      // assert FirestoreService savePreferences method was called with correct arguments
      expect(firestoreService.savePreferences).toHaveBeenCalledWith(
        userId,
        preferencesDto,
      );

      // assert CacheService has and set methods were called with correct arguments
      expect(cacheService.has).toHaveBeenCalledWith(userId);
      expect(cacheService.set).toHaveBeenCalledWith(userId, true);
    });

    it('should return 400 if request data is invalid', async () => {
      const invalidPreferencesDto: PreferencesDto = {
        // set preferencesDto properties with invalid values
        termsAndConditionsAccepted: 'invalid' as any,
        languagePreference: 'invalid' as any,
        showLanguagesPreferences: 'invalid' as any,
        showProfilePreferences: 'invalid' as any,
      };
      const userId = 'test-user-id';

      // mock CacheService set method and prevent it from being called
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(cacheService, 'set').mockImplementation(() => {});

      // make HTTP request with invalid request data
      const response = await request(app.getHttpServer())
        .post('/v1/user/preferences')
        .set('user-id', userId)
        .send(invalidPreferencesDto);

      // assert response
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 500 if an error occurs during processing', async () => {
      const preferencesDto: PreferencesDto = {
        // set preferencesDto properties
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };
      const userId = 'test-user-id';

      // mock FirestoreService savePreferences method to throw an error
      jest
        .spyOn(firestoreService, 'savePreferences')
        .mockRejectedValueOnce(() => {
          console.log('mock used');
          throw new Error('An error occurred while processing your request');
        });

      // make HTTP request
      const response = await request(app.getHttpServer())
        .post('/v1/user/preferences')
        .set('user-id', userId)
        .send(preferencesDto);

      const parsedResponse = JSON.parse(response.text);

      console.log(response.status, response.text);
      // assert response
      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(parsedResponse.message).toBe(
        'An error occurred while processing your request',
      );
    });
    it('should return 409 if the request has already been processed', async () => {
      const preferencesDto: PreferencesDto = {
        // set preferencesDto properties
        termsAndConditionsAccepted: true,
        languagePreference: 'EN',
        showLanguagesPreferences: true,
        showProfilePreferences: true,
      };
      const userId = 'test-user-id';

      // mock CacheService has method to return true
      jest.spyOn(cacheService, 'has').mockReturnValueOnce(true);

      // mock FirestoreService savePreferences method
      jest.spyOn(firestoreService, 'savePreferences').mockResolvedValueOnce();

      // make HTTP request
      const response = await request(app.getHttpServer())
        .post('/v1/user/preferences')
        .set('user-id', userId)
        .send(preferencesDto);

      const parsedResponse = JSON.parse(response.text);
      // assert response
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(parsedResponse.message).toBe('Duplicate request');
    });
  });
});
