import cheerio, { Cheerio, CheerioAPI, Element } from "cheerio";
import { SchoolData } from "../../model/SchoolData";
import { SchoolType } from "../../model/SchoolType";

export class HtmlParseService {
    parse(html: string): SchoolData[] {
        const $ = cheerio.load(html);
        const $schoolTable = this.findSchoolTable($);
        if (!$schoolTable) {
            throw new Error('could not find school table');
        }
        const tableData = this.getTableData($, $schoolTable);
        const parsedTableData = this.parseTableData(tableData);
        return parsedTableData;
    }

    private findSchoolTable($: CheerioAPI): Cheerio<Element> | undefined {
        for (const table of $('table').toArray()) {
            const $table = $(table);
            const columnCount = this.getTableColumnCount($, $table);
            if (columnCount === 5) {
                return $table;
            }
        }
        return undefined;
    }

    private getTableColumnCount($: CheerioAPI, $table: Cheerio<Element>): number {
        const row = $('tr', $table)[0];
        return $('td', row).length;
    }

    private getTableData($: CheerioAPI, $table: Cheerio<Element>): string[][] {
        const results: string[][] = [];
        for (const row of $('tr', $table).toArray()) {
            const $row = $(row);
            const resultRow: string[] = [];
            for (const column of $('td', $row).toArray()) {
                const $column = $(column);
                resultRow.push($column.text());
            }
            results.push(resultRow);
        }
        return results;
    }

    private parseTableData(tableData: string[][]): SchoolData[] {
        return tableData.map(row => {
            if (row[0] === 'School') {
                return undefined;
            }
            const data: SchoolData = {
                name: row[0],
                type: this.parseSchoolType(row[0]),
                staffActiveCases: this.parseIntOrEmpty(row[1]),
                staffQuarantining: this.parseIntOrEmpty(row[2]),
                studentActiveCases: this.parseIntOrEmpty(row[3]),
                studentQuarantining: this.parseIntOrEmpty(row[4])
            };
            return data;
        }).filter((r): r is SchoolData => !!r);
    }

    parseSchoolType(str: string): SchoolType {
        if (str.includes('ES')) {
            return SchoolType.ElementarySchool;
        }
        if (str.includes('MS') || str.includes('Middle')) {
            return SchoolType.MiddleSchool;
        }
        if (str.includes('HS')) {
            return SchoolType.HighSchool;
        }
        if (str === 'Administration Building' || str === 'Transportation') {
            return SchoolType.Other;
        }
        throw new Error(`could not parse school type "${str}"`);
    }

    private parseIntOrEmpty(str: string): number {
        if (!str) {
            return 0;
        }
        str = str.trim();
        if (str.length === 0) {
            return 0;
        }
        return parseInt(str);
    }
}