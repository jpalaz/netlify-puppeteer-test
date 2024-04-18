const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

const url = 'https://lite.cnn.com/'

chromium.setHeadlessMode = true
chromium.setGraphicsMode = false

console.log("Start processing. Launch browser...")

const path = await chromium.executablePath()
console.log("chromium.executablePath = " + path)

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: path,
  headless: "new"
})

export async function handler(event, context) {
  try {
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
