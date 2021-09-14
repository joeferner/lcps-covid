import axios from "axios";
import fs from "fs";
import path from "path";
import { DailyData } from "../../model/DailyData";
import { Data } from "../../model/Data";
import { School } from "../../model/School";
import { HtmlParseService } from "./HtmlParseService";
import puppeteer from "puppeteer";

const htmlParseService = new HtmlParseService();

export async function run(): Promise<void> {
    const dir = getDataDir();
    const dailyData = fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .map(htmlFilename => {
            console.log(`processing ${htmlFilename}`);
            const jsonFile = path.join(dir, `${htmlFilename}.json`);
            let json: DailyData;
            if (fs.existsSync(jsonFile)) {
                json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
                json.date = new Date(json.date);
            } else {
                const html = fs.readFileSync(path.join(dir, htmlFilename), 'utf8');
                json = {
                    date: new Date(htmlFilename.replace('.html', '')),
                    schoolData: htmlParseService.parse(html)
                };
                fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
            }
            return json;
        })
        .sort((a, b) => {
            return a.date.getTime() - b.date.getTime();
        });
    await fetchLatestData(dir, dailyData);
    const schoolNames = new Set<string>(dailyData.flatMap(dd => dd.schoolData.map(sd => sd.name)));
    const schools: School[] = [...schoolNames]
        .map(name => {
            return {
                name
            };
        });
    const all: Data = {
        schools,
        dailyData
    };
    fs.writeFileSync(path.join(__dirname, '../../../build/data.json'), JSON.stringify(all));
    fs.writeFileSync(path.join(__dirname, '../../../public/data.json'), JSON.stringify(all));
}

async function fetchLatestData(dir: string, dailyData: DailyData[]): Promise<void> {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    if (date.getHours() < 4 || date.getHours() > 20) {
        return; // don't update in middle of night
    }
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const filename = path.join(dir, `${dateString}.html`);
    const url = 'https://dashboards.lcps.org/single/?appid=1d6c8c62-0d91-4afa-a220-519e773b332f&sheet=20b44036-ba5a-4b23-bc38-5d901bc974a2&opt=nointeraction,noselections';
    console.log(`fetching ${url} -> ${filename}`);
    const html = await downloadHtml(url);
    const json = {
        date: new Date(dateString),
        schoolData: htmlParseService.parse(html)
    };
    if (JSON.stringify(json.schoolData) !== JSON.stringify(dailyData[dailyData.length - 1].schoolData)) {
        console.log('saving new data');
        await fs.promises.writeFile(filename, html);
        await fs.promises.writeFile(`${filename}.json`, JSON.stringify(json, null, 2));
        dailyData.push(json);
    }
}

async function downloadHtml(url: string): Promise<string> {
    let html;
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox'
        ]
    });
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 2000, height: 100000 })
        await page.goto(url, { waitUntil: 'load' });
        await page.waitForSelector('table .qv-st-value-overflow');
        const html = await page.content();
        return html;
    } finally {
        await browser.close();
    }
}

function getDataDir(): string {
    let dir = '/data/lcps-covid';
    if (!fs.existsSync(dir)) {
        dir = path.join(__dirname, '../../../test-data');
        if (!fs.existsSync(dir)) {
            throw new Error('could not find data path');
        }
    }
    return dir;
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
