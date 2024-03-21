/* eslint-disable class-methods-use-this */
import fs from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { csvToJson, getFileNames, mapCsvToJSON, FILE_TYPE, generateXMLFromJSON } from '../../../util/generateUtils.js';
import { PROFILE_POSTFIX } from '../../../util/constants.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-papers-please', 'generate.profile');

export type GenerateProfileResult = {
  success: boolean;
};

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
    'output-directory': Flags.directory({
      summary: messages.getMessage('flags.output-directory.summary'),
      char: 'p',
      required: true,
    }),
  };

  public async run(): Promise<GenerateProfileResult> {
    const { flags } = await this.parse(GenerateProfile);

    const csvPath: string = flags['csv-file'];
    const outputPath: string = flags['output-directory'];

    const csvInput: string = fs.readFileSync(csvPath, {
      encoding: 'utf-8',
    });
    const rawJsonConversion: Array<Record<string, string>> = csvToJson(csvInput);
    const profilesToCreate = getFileNames(rawJsonConversion[0]);
    const preppedJsonForConversion = mapCsvToJSON(rawJsonConversion, profilesToCreate, FILE_TYPE.PROFILE);
    // this.logJson(preppedJsonForConversion);
    profilesToCreate.forEach((profile) => {
      generateXMLFromJSON(preppedJsonForConversion[profile], profile, outputPath, PROFILE_POSTFIX);
    });

    return {
      success: true,
    };
  }
}
