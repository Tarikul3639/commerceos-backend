import { Test } from '@nestjs/testing';
import { describe, it } from 'vitest';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Application', () => {
  it('returns Not Found for the unregistered root route', async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = testingModule.createNestApplication();

    try {
      await app.init();

      await request(app.getHttpServer() as never)
        .get('/')
        .expect(404);
    } finally {
      await app.close();
    }
  });
});
