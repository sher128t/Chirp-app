import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
    };

    let accessToken: string;
    let refreshToken: string;

    it('/api/auth/register (POST) - should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('/api/auth/register (POST) - should fail for duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('/api/auth/login (POST) - should login user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      accessToken = response.body.accessToken;
    });

    it('/api/auth/login (POST) - should fail with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ ...testUser, password: 'wrongpassword' })
        .expect(401);
    });

    it('/api/me (GET) - should return user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('/api/me (GET) - should fail without token', async () => {
      await request(app.getHttpServer()).get('/api/me').expect(401);
    });

    // Cleanup
    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    });
  });

  describe('Pet', () => {
    let accessToken: string;
    const testUser = {
      email: 'pet-test@example.com',
      password: 'testpassword123',
    };

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
      accessToken = response.body.accessToken;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    });

    it('/api/pet (GET) - should return pet', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/pet')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('level');
      expect(response.body).toHaveProperty('xp');
      expect(response.body).toHaveProperty('energy');
      expect(response.body).toHaveProperty('happiness');
    });

    it('/api/pet (PATCH) - should update pet name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/pet')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Fluffy' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Fluffy');
    });
  });

  describe('Moods', () => {
    let accessToken: string;
    const testUser = {
      email: 'mood-test@example.com',
      password: 'testpassword123',
    };

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
      accessToken = response.body.accessToken;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    });

    it('/api/moods (POST) - should create mood entry', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/moods')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          moodScore: 4,
          moodLabel: 'Good',
          tags: ['Work', 'Friends'],
          notes: 'Had a great day!',
        })
        .expect(201);

      expect(response.body).toHaveProperty('moodScore', 4);
      expect(response.body).toHaveProperty('moodLabel', 'Good');
    });

    it('/api/moods (GET) - should return mood entries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/moods')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

