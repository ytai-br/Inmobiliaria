const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

test.beforeEach(async ({ page }) => {
  // The embedded third-party map is not part of the local functional checks.
  await page.route('https://www.google.com/maps**', route => route.fulfill({ contentType: 'text/html', body: '<html lang="es"><title>Mapa</title><body style="background:#e5ece7">Mapa externo</body></html>' }));
  await page.goto('/');
});

test('renders all seven projects with working local images, fonts and libraries', async ({ page }) => {
  await expect(page.locator('.project-card')).toHaveCount(7);
  expect(await page.evaluate(() => jQuery.fn.jquery)).toBe('3.7.1');
  expect(await page.evaluate(() => bootstrap.Modal.VERSION)).toBe('5.3.8');
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => image.loading = 'eager');
    await Promise.all([...document.images].map(image => image.decode()));
    await document.fonts.ready;
  });
  expect(await page.locator('img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true);
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await page.screenshot({ path: '.local/desktop.png', fullPage: true });
});

test('combines type, status and price, handles no results and resets filters', async ({ page }) => {
  const visible = page.locator('.project-card:visible');
  await page.selectOption('#filter-type', '1d');
  await page.selectOption('#filter-status', 'preventa');
  await page.selectOption('#filter-price', 'under100');
  await expect(visible).toHaveCount(2);
  await expect(page.locator('#results-count')).toHaveText('2 edificios encontrados de 7');
  await page.locator('#search-form button').click();
  await page.selectOption('#filter-type', 'penthouse');
  await expect(visible).toHaveCount(0);
  await expect(page.locator('#empty-results')).toBeVisible();
  await page.locator('#empty-results .reset-filters').click();
  await expect(visible).toHaveCount(7);
  await page.locator('.filter-chip[data-status="entrega"]').click();
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute('data-project', 'grand-park');
  await expect(page.locator('#filter-status')).toHaveValue('entrega');
});

test('all galleries switch thumbnails, open, navigate, zoom and restore focus', async ({ page }) => {
  for (const card of await page.locator('.project-card').all()) {
    const thumbnail = card.locator('.gallery-thumb').nth(2);
    await thumbnail.click();
    await expect(thumbnail).toHaveAttribute('aria-pressed', 'true');
    await expect(card.locator('.project-cover')).toHaveAttribute('src', /-2\.jpg$/);
    const open = card.locator('.open-gallery');
    await open.click();
    await expect(page.locator('#gallery-modal')).toBeVisible();
    await expect(page.locator('#gallery-caption')).toContainText('3 / 5');
    await expect(page.locator('#gallery-modal')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#gallery-caption')).toContainText('4 / 5');
    await page.locator('.gallery-prev').click();
    await expect(page.locator('#gallery-caption')).toContainText('3 / 5');
    await page.locator('#gallery-zoom').click();
    await expect(page.locator('.gallery-stage')).toHaveClass(/zoomed/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#gallery-modal')).toBeHidden();
    await expect(open).toBeFocused();
  }
});

test('project details carry the selected building into the inquiry', async ({ page }) => {
  await page.locator('#edificio-laureles .project-detail').click();
  await expect(page.locator('#detail-title')).toHaveText('Residencias Los Laureles América');
  await expect(page.locator('#detail-content')).toContainText('84');
  await page.locator('#detail-contact').click();
  await expect(page.locator('#project-modal')).toBeHidden();
  await expect(page.locator('#contact-project')).toHaveValue('laureles');
  await expect(page.locator('#contact-message')).toHaveValue(/Residencias Los Laureles América/);
  await expect(page.locator('#contact-name')).toBeFocused();
});

test('contact rejects invalid inputs and creates an encoded WhatsApp message for the selected advisor', async ({ page }) => {
  await page.locator('.advisor-appointment[data-advisor="1"]').click();
  await expect(page.locator('#contact-advisor')).toHaveValue('1');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-result')).toBeHidden();
  await page.fill('#contact-name', 'María & José');
  await page.fill('#contact-phone', 'not a phone');
  await page.fill('#contact-email', 'maria@example.com');
  await page.check('#contact-consent');
  await page.locator('#contact-form button[type="submit"]').click();
  expect(await page.locator('#contact-phone').evaluate(input => input.validity.valid)).toBe(false);
  await page.fill('#contact-phone', '+591 71234567');
  await page.fill('#contact-message', 'Consulta con ñ, & y #. <script>alert(1)</script>');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-result')).toBeVisible();
  const url = new URL(await page.locator('#send-whatsapp').getAttribute('href'));
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/59171712345');
  expect(url.searchParams.get('text')).toContain('María & José');
  expect(url.searchParams.get('text')).toContain('Consulta con ñ, & y #. <script>alert(1)</script>');
  await page.fill('#contact-name', 'Otro nombre');
  await expect(page.locator('#contact-result')).toBeHidden();
  await expect(page.locator('#send-whatsapp')).not.toHaveAttribute('href');
});

test('visits require a present or future date and are explicitly pending confirmation', async ({ page }) => {
  await page.locator('.navbar .schedule-link').click();
  await expect(page.locator('#visit-fields')).toBeVisible();
  await page.fill('#contact-name', 'Cliente de prueba');
  await page.fill('#contact-phone', '+591 71234567');
  await page.fill('#contact-email', 'cliente@example.com');
  await page.check('#contact-consent');
  await page.fill('#visit-date', '2020-01-01');
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-result')).toBeHidden();
  expect(await page.locator('#visit-date').evaluate(input => input.validity.rangeUnderflow)).toBe(true);
  await page.fill('#visit-date', await page.locator('#visit-date').getAttribute('min'));
  await page.locator('#contact-form button[type="submit"]').click();
  await expect(page.locator('#contact-result')).toBeVisible();
  expect(new URL(await page.locator('#send-whatsapp').getAttribute('href')).searchParams.get('text')).toContain('(por confirmar)');
});

test('mobile navigation collapses, layout fits small screens and controls work', async ({ page }) => {
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.navbar-toggler').click();
  await expect(page.locator('#navigation')).toBeVisible();
  await page.locator('.navbar .nav-link[href="#proyectos"]').click();
  await expect(page.locator('#navigation')).toBeHidden();
  await page.locator('.filter-chip[data-status="preventa"]').click();
  await expect(page.locator('.project-card:visible')).toHaveCount(3);
  await page.locator('.collection-note .reset-filters').click();
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(image => image.loading = 'eager'); await Promise.all([...document.images].map(image => image.decode())); });
  await page.screenshot({ path: '.local/mobile.png', fullPage: true });
});

test('works directly from index.html without a server or remote libraries', async ({ page }) => {
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  await expect(page.locator('.project-card')).toHaveCount(7);
  await page.selectOption('#filter-type', 'penthouse');
  await expect(page.locator('.project-card:visible')).toHaveCount(1);
});

test('has no runtime errors, duplicate ids, unlabeled controls or broken local assets', async ({ page }) => {
  const errors = [];
  const missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) missing.push(response.url()); });
  await page.reload();
  await page.evaluate(async () => { document.querySelectorAll('img').forEach(image => image.loading = 'eager'); await Promise.all([...document.images].map(image => image.decode())); await document.fonts.ready; });
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
  const issues = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
    return { duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), unlabeled: [...document.querySelectorAll('input, select, textarea')].filter(el => !el.labels?.length && !el.getAttribute('aria-label')).map(el => el.id) };
  });
  expect(issues).toEqual({ duplicateIds: [], unlabeled: [] });
});
