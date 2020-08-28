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

    const exec = require('child_process').exec
    exec('mkfontscale && mkfontdir && fc-cache')

    const margin = req.body.margin ?? {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    }

    const filename = Math.random().toString(36).substring(7)
    const pdf = `${__dirname}/${filename}.pdf`

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
