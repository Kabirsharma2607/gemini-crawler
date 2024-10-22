import { PlaywrightCrawler } from "playwright";
import * as fs from "fs";
import * as path from "path";
const skipKeywords = [
  "Log out",
  "Log Out",
  "log out",
  "Sign out",
  "sign out",
  "Sign up",
  "Close",
];

// Function to sanitize the URL to a valid filename
const sanitizeFilename = (url) => {
  return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
};

// Create a directory to store screenshots if it doesn't exist
const screenshotsDir = "./public/screenshots";
fs.mkdirSync(screenshotsDir, { recursive: true });

// Set to track visited URLs
const visitedUrls = new Set();

// Flag to track if the user is logged in
let isLoggedIn = false;
let screenshotCount = 0; // Counter for screenshots

// Modify this to be a generic login URL
const loginUrl = "https://sanskruty.com/my-account/";

export const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks, log, pushData }) {
    const { loadedUrl } = request;

    // Check if the URL contains "sans" and is not already visited
    if (!loadedUrl.includes("sans") || visitedUrls.has(loadedUrl)) {
      log.info(`Skipping URL: ${loadedUrl}`);
      return;
    }

    // Add the current URL to the visited set
    visitedUrls.add(loadedUrl);

    // Log the page title
    const title = await page.title();
    log.info(`Title of ${loadedUrl} is '${title}'`);

    // Save results as JSON to ./storage/datasets/default
    await pushData({ title, url: loadedUrl });

    // Sanitize the URL and create a screenshot file name
    const sanitizedUrl = sanitizeFilename(loadedUrl);
    const screenshotPath = path.join(screenshotsDir, `${sanitizedUrl}.png`);

    // Take a screenshot of the page and save it
    await page.screenshot({ path: screenshotPath });
    log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

    // Increment the screenshot counter
    screenshotCount++;
    if (screenshotCount >= 5) {
      log.info("Screenshot limit reached. Stopping the crawler.");
      await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
      return; // Exit the request handler
    }

    // Ensure the page has fully loaded (React may load content dynamically)
    await page.waitForTimeout(2000);

    // Find all button elements
    const clickableElements = await page.evaluate(() => {
      return [...document.querySelectorAll("button")].map((el) => ({
        tagName: el.tagName,
        textContent: el.textContent.trim(),
        href: el.href, // Note: `href` may be undefined for buttons
        outerHTML: el.outerHTML,
      }));
    });

    log.info(`Found ${clickableElements.length} clickable buttons`);

    // Click each button element and capture screenshots
    for (const element of clickableElements) {
      if (
        skipKeywords.some((keyword) => element.textContent.includes(keyword))
      ) {
        log.info(`Skipping button: ${element.textContent}`);
        continue; // Skip clicking this button
      }

      log.info(
        `Opening button: ${element.tagName} with text: ${element.textContent}`
      );

      try {
        // Click the button
        await page.click(`button:has-text("${element.textContent}")`);

        // Wait for navigation after clicking the button
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Take a screenshot of the new page
        const clickedScreenshotPath = path.join(
          screenshotsDir,
          `${sanitizeFilename(loadedUrl)}_clicked.png`
        );
        await page.screenshot({ path: clickedScreenshotPath });
        log.info(
          `Screenshot saved for button click at ${clickedScreenshotPath}`
        );

        // Increment the screenshot counter
        screenshotCount++;
        if (screenshotCount >= 5) {
          log.info(
            "Screenshot limit reached after button click. Stopping the crawler."
          );
          await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
          return; // Exit the request handler
        }
      } catch (error) {
        log.error(
          `Failed to open button ${element.textContent}: ${error.message}`
        );
      }
    }

    // Extract links from the current page
    await enqueueLinks();
  },
  maxRequestsPerCrawl: 2, // Increased to explore more pages
  // headless: false,
  preNavigationHooks: [
    async ({ page, log, userData }) => {
      if (!isLoggedIn) {
        log.info("Logging in...");

        // Go to the login page
        await page.goto(loginUrl);

        // Fill in the credentials from userData
        await page.fill(
          'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]',
          userData.email
        );

        await page.fill(
          'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]',
          userData.password
        );

        // Click the login button
        await page.click(
          'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Set login flag
        isLoggedIn = true;
      }
    },
  ],
});

// Function to start crawling the specified URL with credentials
export const startCrawl = async (website, email, password) => {
  // Store user data in a temporary object
  const userData = { email, password };

  await crawler.run({
    startUrls: [website],
    userData, // Pass userData to the crawler
  });
};

// const skipKeywords = [
//   "Log out",
//   "Log Out",
//   "log out",
//   "Sign out",
//   "sign out",
//   "Sign up",
//   "Close",
// ];

// // Function to sanitize the URL to a valid filename
// const sanitizeFilename = (url) => {
//   return url.replace(/[^a-z0-9]/gi, "_").toLowerCase();
// };

// // Create a directory to store screenshots if it doesn't exist
// const screenshotsDir = "./public/screenshots";
// mkdirSync(screenshotsDir, { recursive: true });

// // Set to track visited URLs
// const visitedUrls = new Set();

// // Flag to track if the user is logged in
// let isLoggedIn = false;
// let screenshotCount = 0; // Counter for screenshots

// const loginUrl = "https://sanskruty.com/my-account/";
// const username = "kabiragnihotri@gmail.com";
// const password = "Admin@12345";

// const crawler = new PlaywrightCrawler({
//   async requestHandler({ request, page, enqueueLinks, log, pushData }) {
//     const { loadedUrl } = request;

//     // Check if the URL contains "sans" and is not already visited
//     if (!loadedUrl.includes("sans") || visitedUrls.has(loadedUrl)) {
//       log.info(`Skipping URL: ${loadedUrl}`);
//       return;
//     }

//     // Add the current URL to the visited set
//     visitedUrls.add(loadedUrl);

//     // Log the page title
//     const title = await page.title();
//     log.info(`Title of ${loadedUrl} is '${title}'`);

//     // Save results as JSON to ./storage/datasets/default
//     await pushData({ title, url: loadedUrl });

//     // Sanitize the URL and create a screenshot file name
//     const sanitizedUrl = sanitizeFilename(loadedUrl);
//     const screenshotPath = join(screenshotsDir, `${sanitizedUrl}.png`);

//     // Take a screenshot of the page and save it
//     await page.screenshot({ path: screenshotPath });
//     log.info(`Screenshot saved for ${loadedUrl} at ${screenshotPath}`);

//     // Increment the screenshot counter
//     screenshotCount++;
//     if (screenshotCount >= 5) {
//       log.info("Screenshot limit reached. Stopping the crawler.");
//       await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
//       return; // Exit the request handler
//     }

//     // Ensure the page has fully loaded (React may load content dynamically)
//     await page.waitForTimeout(2000);

//     // Find all button elements
//     const clickableElements = await page.evaluate(() => {
//       return [...document.querySelectorAll("button")].map((el) => ({
//         tagName: el.tagName,
//         textContent: el.textContent.trim(),
//         href: el.href, // Note: `href` may be undefined for buttons
//         outerHTML: el.outerHTML,
//       }));
//     });

//     log.info(`Found ${clickableElements.length} clickable buttons`);

//     // Click each button element and capture screenshots
//     for (const element of clickableElements) {
//       if (
//         skipKeywords.some((keyword) => element.textContent.includes(keyword))
//       ) {
//         log.info(`Skipping button: ${element.textContent}`);
//         continue; // Skip clicking this button
//       }

//       log.info(
//         `Opening button: ${element.tagName} with text: ${element.textContent}`
//       );

//       try {
//         // Click the button
//         await page.click(`button:has-text("${element.textContent}")`);

//         // Wait for navigation after clicking the button
//         await new Promise((resolve) => setTimeout(resolve, 3000));

//         // Take a screenshot of the new page
//         const clickedScreenshotPath = join(
//           screenshotsDir,
//           `${sanitizeFilename(loadedUrl)}_clicked.png`
//         );
//         await page.screenshot({ path: clickedScreenshotPath });
//         log.info(
//           `Screenshot saved for button click at ${clickedScreenshotPath}`
//         );

//         // Increment the screenshot counter
//         screenshotCount++;
//         if (screenshotCount >= 5) {
//           log.info(
//             "Screenshot limit reached after button click. Stopping the crawler."
//           );
//           await crawler.autostop(); // Stop the crawler if 5 screenshots are taken
//           return; // Exit the request handler
//         }
//       } catch (error) {
//         log.error(
//           `Failed to open button ${element.textContent}: ${error.message}`
//         );
//       }
//     }

//     // Extract links from the current page
//     await enqueueLinks();
//   },
//   maxRequestsPerCrawl: 2, // Increased to explore more pages
//   headless: false,
//   preNavigationHooks: [
//     async ({ page, log }) => {
//       if (!isLoggedIn) {
//         log.info("Logging in...");

//         // Go to the login page
//         await page.goto(loginUrl);

//         // Fill in the credentials
//         await page.fill(
//           'input[type="email"], input[name*="email"], input[id*="email"], input[placeholder*="email"], input[type="text"]',
//           username
//         );

//         await page.fill(
//           'input[type="password"], input[name*="password"], input[id*="password"], input[placeholder*="password"]',
//           password
//         );

//         // Click the login button
//         await page.click(
//           'button[type="submit"], button[name*="sign in"], button[id*="login"], button[type="button"]'
//         );
//         await new Promise((resolve) => setTimeout(resolve, 3000));

//         // Set login flag
//         isLoggedIn = true;
//       }
//     },
//   ],
// });

// // Start the crawl
// crawler.run(["https://sanskruty.com"]);

// // export const startCrawler = ({loginUrl, email, password}) => {

// // }

export const name = "Kabir";
