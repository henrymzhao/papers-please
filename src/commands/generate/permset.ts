import fs from 'node:fs';
import path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { csvToJson, FILE_TYPE, getFileNames, mapCsvToJSON } from '../../util/generateUtils.js';
import json2xml from '../../util/json2xml.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('papers-please', 'generate.permset');

export type GeneratePermsetResult = {
  path: string;
};

export default class GeneratePermset extends SfCommand<GeneratePermsetResult> {
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
    'output-directory': Flags.directory({
      summary: messages.getMessage('flags.output-directory.summary'),
      char: 'p',
      required: true,
    }),
  };

  public async run(): Promise<GeneratePermsetResult> {
    const { flags } = await this.parse(GeneratePermset);
    const csvPath: string = flags['csv-file'];
    const outputPath: string = flags['output-directory'];
    const csvInput: string = fs.readFileSync(csvPath, {
      encoding: 'utf-8',
    });
    const rawJsonConversion: Array<Record<string, string>> = csvToJson(csvInput);
    const profilesToCreate = getFileNames(rawJsonConversion[0]);
    const preppedJsonForConversion = mapCsvToJSON(rawJsonConversion, profilesToCreate, FILE_TYPE.PROFILE);

    profilesToCreate.forEach((profile) => {
      const profileData = preppedJsonForConversion[profile];
      fs.mkdirSync(outputPath, { recursive: true });
      fs.writeFileSync(
        path.join(outputPath, `${profile}.permissionset-meta.xml`),
        '<?xml version="1.0" encoding="UTF-8"?>\n' + json2xml(profileData)
      );
    });

    return {
      path: '/Users/henryzhao/Documents/papers-please/src/commands/generate/permset.ts',
    };
  }
}
