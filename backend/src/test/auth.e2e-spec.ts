import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getValidationPipe } from '@shared/config/validation-pipe.config';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../app.module';
import { BenchmarkInterceptor } from '@shared/common/interceptors/benchmark.interceptor';
import { RedisIoAdapter } from '@infrastructure/redis-adapter/redis-adapter';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { execSync } from 'child_process';
import { PrismaExceptionFilter } from '@shared/common/exception/prisma-filter';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let dbContainer: StartedPostgreSqlContainer;
  let redisContainer: StartedRedisContainer;
  let redisAdapter: RedisIoAdapter;

  const testUser = {
    username: `user_${Date.now()}`,
    email: `e2e_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    dbContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();
    redisContainer = await new RedisContainer('redis:7-alpine').start();

    const databaseUrl = dbContainer.getConnectionUri();
    const redisHost = redisContainer.getHost();
    const redisPort = redisContainer.getMappedPort(6379).toString();
    process.env.DATABASE_URL = databaseUrl;
    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = redisPort;

    execSync('npx prisma db push', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    const moduleFixtuire: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixtuire.createNestApplication({
      rawBody: true,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(getValidationPipe()));
    app.useGlobalInterceptors(new BenchmarkInterceptor());
    app.useGlobalFilters(new PrismaExceptionFilter());

    app.enableCors({
      origin: 'http://localhost:4000',
      credentials: true,
    });
    const config = app.get(ConfigService);

    redisAdapter = new RedisIoAdapter(app, config);
    app.useWebSocketAdapter(redisAdapter);

    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
    if (redisAdapter) await redisAdapter.disconnect();
    if (dbContainer) await dbContainer.stop();
    if (redisContainer) await redisContainer.stop();
  });

  describe('POST /auth/register', () => {
    const randomId = Math.floor(100000 + Math.random() * 900000);

    it('should register a new user and set refresh token cookie', async () => {
      const uniqueUser = {
        username: `e2e:user${randomId}`,
        email: `e2e${randomId}@example.com`,
        password: 'Password123!',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(uniqueUser)
        .expect(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail to register with same email', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });
  });
  describe('POST /auth/login', () => {
    const randomId = Math.floor(100000 + Math.random() * 900000);

    const registerUser = {
      username: `e2e:login${randomId}`,
      email: `e2e_login${randomId}@example.com`,
      password: 'Password123!',
    };
    const loginUser = {
      identity: `e2e:login${randomId}`,
      password: 'Password123!',
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerUser)
        .expect(201);
    });

    it('should login the user and set refresh token cookie', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        identity: loginUser.identity,
        password: loginUser.password,
      });

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail to login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identity: loginUser.identity,
          password: 'WrongPassword1234!',
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const registerUser = {
      username: `e2e:refresh${randomId}`,
      email: `e2e_refresh${randomId}@example.com`,
      password: 'Password123!',
    };

    let refreshCookie: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerUser)
        .expect(201);

      refreshCookie = res.headers['set-cookie'][0];
    });

    it('should issue a new access token using the refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail to refresh without a refresh token cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should fail to logout without a valid access token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
