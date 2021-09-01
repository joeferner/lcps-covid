import { HtmlParseService } from "./HtmlParseService";
import fs from "fs";
import path from "path";
import { SchoolType } from "../model/SchoolType";

test('parses', async () => {
    const parser = new HtmlParseService();
    const html = await fs.promises.readFile(path.join(__dirname, "../../test-data/covid-case-data.html"), 'utf8');
    const schoolData = parser.parse(html);
    expect(schoolData.length).toBe(32);
    expect(schoolData[0].name).toBe('Arcola ES');
    expect(schoolData[0].type).toBe(SchoolType.ElementarySchool);
    expect(schoolData[0].staffActiveCases).toBe(0);
    expect(schoolData[0].staffQuarantining).toBe(0);
    expect(schoolData[0].studentActiveCases).toBe(1);
    expect(schoolData[0].studentQuarantining).toBe(0);
});
