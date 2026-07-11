const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/dist/index.html')));

const server = app.listen(5000, async () => {
  console.log('Server started on port 5000');
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.log('UNCAUGHT EXCEPTION:', err.toString());
    });
    
    await page.goto('http://localhost:5000');
    
    // Wait a bit to let React render
    await new Promise(r => setTimeout(r, 2000));
    
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log('Root HTML length:', rootHtml.length);
    if (rootHtml.length < 50) {
      console.log('Root HTML is basically empty (Blank screen!)');
    } else {
      console.log('Root HTML looks populated!');
    }
    
    await browser.close();
  } catch (e) {
    console.error(e);
  } finally {
    server.close();
  }
});
