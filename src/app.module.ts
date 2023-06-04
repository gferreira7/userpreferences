import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirestoreService } from './services/firestore.service';
import { CacheService } from './services/cache.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FirestoreService, CacheService],
})
export class AppModule {}
