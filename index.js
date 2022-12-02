const express = require('express')
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer')
const fs = require('fs')

const app = express()
const port = 80

app.use('/fonts', express.static('/fonts'))

// app.use(bodyParser.raw({ type: 'html', limit: '5mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))

app.get('/', (req, res) => {
    res.redirect('//' + process.env.APP_DOMAIN ?? 'eventos.sobral.ufc.br')
})

app.post('/pdf', async (req, res) => {
    // console.log(req.body)
    // res.send(req.body)

    /* const exec = require('child_process').exec
    exec('mkfontscale && mkfontdir && fc-cache') */

    const margin = req.body.margin ?? {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }

    const filename = Math.random().toString(36).substring(7)
    const pdf = `${__dirname}/${filename}.pdf`

    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        devtools: false,
        args: [
            '--no-sandbox',
            // '--disable-web-security',
            // '--disable-features=IsolateOrigins',
            // '--disable-site-isolation-trials',
            /* https://docs.browserless.io/blog/2020/09/30/puppeteer-print.html#use-a-special-launch-flag */
            // '--font-render-hinting=none'
        ],
    })
    const page = await browser.newPage()

    page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`)
    })

    /* https://pptr.dev/api/puppeteer.page.setcontent#remarks
     * `waitUntil`: When to consider setting markup succeeded,
     * defaults to load. Given an array of event strings, setting
     * content is considered to be successful after all events have
     * been fired. Events can be either:
     * 
     * - `load`: consider setting content to be finished when the load event is fired.
     * - `domcontentloaded`: consider setting content to be finished when the
     *    DOMContentLoaded event is fired.
     * - `networkidle0`: consider setting content to be finished when there are
     *    no more than 0 network connections for at least 500 ms.
     * - `networkidle2`: consider setting content to be finished when there are
     *    no more than 2 network connections for at least 500 ms.
     */
    await page.setContent(req.body.payload, {waitUntil: 'networkidle0'})
    await page.emulateMediaType('screen')
    await page.pdf({
        path: pdf,
        format: req.body.format ?? 'A4',
        printBackground: true,
        landscape: req.body.landscape ?? true,
        margin,
        pageRanges: req.body.pageRanges ?? '',
    })

    await browser.close()

    res.path = pdf

    res.sendFile(pdf)
    res.on('finish', () => {
        const fs = require('fs')
        fs.unlinkSync(res.path)
    })
})

app.post('/jpeg', async (req, res) => {
    // console.log(req.body)
    // res.send(req.body)

    const exec = require('child_process').exec
    exec('mkfontscale && mkfontdir && fc-cache')

    const margin = req.body.margin ?? {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }

    const filename = Math.random().toString(36).substring(7)
    const path = `${__dirname}/${filename}.jpeg`

    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
    })
    const page = await browser.newPage()

    page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`)
    })

    await page.setContent(req.body.payload)
    await page.emulateMediaType('screen')
    await page.screenshot({
        path: path,
        type: 'jpeg',
        fullPage: true,
    })

    await browser.close()

    res.path = path

    res.sendFile(path)
    res.on('finish', () => {
        fs.unlinkSync(res.path)
    })
})

app.listen(port, () => {
    console.log(`Aguardando HTML para converter em PDF…`)
})
