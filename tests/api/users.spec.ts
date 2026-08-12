import { test, expect } from '@playwright/test';
import { environment } from '../../src/config/environment.js';

test.describe('API: Posts', () => {
  test('GET /posts returns a list of posts @smoke', async ({ request }) => {
    const response = await request.get(`${environment.apiBaseURL}/posts`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /posts/:id returns a single post @smoke', async ({ request }) => {
    const response = await request.get(`${environment.apiBaseURL}/posts/1`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('id', 1);
    expect(body).toHaveProperty('title');
  });

  test('GET /posts/:id returns 404 for non-existent post @regression', async ({ request }) => {
    const response = await request.get(`${environment.apiBaseURL}/posts/9999`);
    expect(response.status()).toBe(404);
  });

  test('POST /posts creates a post and returns 201 @regression', async ({ request }) => {
    const response = await request.post(`${environment.apiBaseURL}/posts`, {
      data: { title: 'Playwright Test', body: 'API layer test', userId: 1 },
    });
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Playwright Test');
  });

  test('PUT /posts/:id updates a post @regression', async ({ request }) => {
    const response = await request.put(`${environment.apiBaseURL}/posts/1`, {
      data: { id: 1, title: 'Updated Title', body: 'Updated body', userId: 1 },
    });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe('Updated Title');
  });
});
