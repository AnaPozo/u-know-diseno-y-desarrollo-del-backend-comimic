import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import databaseConfig from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { RolesGuard } from './user/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('db'),
    }),
    UserModule,
    AuthModule,
    CourseModule,
  ],
  controllers: [AppController],
  providers: [AppService,
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  }
],
})
export class AppModule {}
