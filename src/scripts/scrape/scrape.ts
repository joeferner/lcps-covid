import axios from "axios";
import fs from "fs";
import path from "path";
import { DailyData } from "../../model/DailyData";
import { Data } from "../../model/Data";
import { School } from "../../model/School";
import { HtmlParseService } from "./HtmlParseService";

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
    const date = new Date();
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const filename = path.join(dir, `${dateString}.html`);
    if (fs.existsSync(filename)) {
        return;
    }
    const url = 'https://www.lcps.org/COVID19data';
    console.log(`fetching ${url} -> ${filename}`);
    const response = await axios.get(url);
    if (response.status !== 200) {
        console.error(response);
        throw new Error('bad fetch');
    }
    const json = {
        date: new Date(dateString),
        schoolData: htmlParseService.parse(response.data)
    };
    if (JSON.stringify(json.schoolData) !== JSON.stringify(dailyData[dailyData.length - 1].schoolData)) {
        console.log('saving new data');
        await fs.promises.writeFile(filename, response.data);
        await fs.promises.writeFile(`${filename}.json`, JSON.stringify(json, null, 2));
        dailyData.push(json);
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
