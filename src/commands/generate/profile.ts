/* eslint-disable class-methods-use-this */
import fs from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('papers-please', 'generate.profile');

export type GenerateProfileResult = {
  success: boolean;
};

const DELIMITER: string = ',';

export default class GenerateProfile extends SfCommand<GenerateProfileResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'csv-file': Flags.file({
      summary: messages.getMessage('flags.csv-file.summary'),
      char: 'c',
      required: true,
      exists: true,
    }),
  };

  public async run(): Promise<GenerateProfileResult> {
    const { flags } = await this.parse(GenerateProfile);

    const csvPath: string = flags['csv-file'];

    const csvInput: string = fs.readFileSync(csvPath, {
      encoding: 'utf-8',
    });
    const foo = this.csvToJson(csvInput);

    this.log(JSON.stringify(foo));

    return {
      success: false,
    };
  }

  private csvToJson(csvInput: string): Map[] {
    const lines = csvInput.split('\n');

    const res = [];

    const headers: string[] = lines[0].split(DELIMITER).map((val) => val.trim());

    for (let i = 1; i < lines.length; i++) {
      const obj: Map = {};
      const curLine = lines[i].split(DELIMITER);

      curLine.forEach((cell, index) => {
        obj[headers[index]] = cell.trim();
      });
      res.push(obj);
    }
    return res;
  }
}

interface Map {
  [key: string]: string | undefined;
}
