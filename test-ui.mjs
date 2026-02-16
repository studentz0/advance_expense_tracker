import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login');
    
    // Wait for the form to appear
    await page.waitForSelector('h1');
    
    console.log('Capturing screenshot...');
    await page.screenshot({ path: 'login-screenshot.png', fullPage: true });
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const h1Text = await page.textContent('h1');
    console.log(`Main heading: ${h1Text}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
