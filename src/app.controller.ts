import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PreferencesDto } from './dto/preferences.dto';
import { FirestoreService } from './services/firestore.service';
import { CacheService } from './services/cache.service';
import { validate } from 'class-validator';

@Controller('v1/user')
export class AppController {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly cacheService: CacheService,
  ) { }

  @Post('preferences')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async savePreferences(
    @Body() preferencesDto: PreferencesDto,
    @Headers('user-id') userId: string,
  ): Promise<string> {
    try {
      if (!userId)
        throw new HttpException('Incorrect userId', HttpStatus.BAD_REQUEST);

      const errors = await validate(preferencesDto);
      if (errors.length > 0) {
        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
      }

      // Check if the request has already been processed
      if (this.cacheService.has(userId)) {
        throw new HttpException('Duplicate request', HttpStatus.CONFLICT);
      }

      // Save the preferences data to Firestore
      await this.firestoreService.savePreferences(userId, preferencesDto);

      // Add the user ID o the cache to prevent duplicates
      this.cacheService.set(userId, true);

      return 'Preferences saved';
    } catch (error) {
      console.log('catch');
      if (error instanceof HttpException) {
        throw error;
      }
        console.log(error.message, error.statusCode);
        throw new HttpException(
          'An error occurred while processing your request',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
