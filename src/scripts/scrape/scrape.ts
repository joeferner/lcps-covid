import axios from "axios";
import fs from "fs";
import path from "path";
import { DailyData } from "../../model/DailyData";
import { HtmlParseService } from "./HtmlParseService";

const htmlParseService = new HtmlParseService();

export async function run(): Promise<void> {
    const dir = getDataDir();
    await fetchLatestData(dir);
    const allData = fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .map(htmlFilename => {
            console.log(`processing ${htmlFilename}`);
            const jsonFile = path.join(dir, `${htmlFilename}.json`);
            let json: DailyData;
            if (fs.existsSync(jsonFile)) {
                json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
            } else {
                const html = fs.readFileSync(path.join(dir, htmlFilename), 'utf8');
                json = {
                    date: new Date(htmlFilename.replace('.html', '')),
                    schoolData: htmlParseService.parse(html)
                };
                fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
            }
            return json;
        });
    fs.writeFileSync(path.join(__dirname, '../../../build/data.json'), JSON.stringify(allData, null, 2));
    fs.writeFileSync(path.join(__dirname, '../../../public/data.json'), JSON.stringify(allData, null, 2));
}

async function fetchLatestData(dir: string): Promise<void> {
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
    await fs.promises.writeFile(filename, response.data);
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
