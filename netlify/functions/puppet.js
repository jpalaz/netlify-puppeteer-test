import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const url = 'https://lite.cnn.com/'

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

export async function handler(event, context) {
  try {
    console.log("Start processing. Launch browser...")

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar"
      ),
      headless: "new"
    })

    const page = await browser.newPage()

    console.log("opening page...")

    await page.goto(url)

    console.log("awaiting for title to be loaded")

    await page.waitForSelector('.title')

    console.log("awaiting list of titles")

    const results = await page.$$eval('ul li', (articles) => {
      return articles.slice(0,5).map((link) => {
        console.log("reading the next article...")
        return {
          title: link.querySelector('a').innerText,
          url: link.querySelector('a').href,
        }
      })
    })

    await browser.close()

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    }
  }
}
