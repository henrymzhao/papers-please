/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'node:fs';
import { Flags, SfCommand } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { PROFILE_POSTFIX } from '../../../util/constants.js';
import { convertXMLToCSV } from '../../../util/convertUtils.js';
import { FILE_TYPE } from '../../../util/generateUtils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-papers-please', 'convert.profile');

export type ConvertProfileResult = {
  path: string;
};

export default class ConvertProfile extends SfCommand<ConvertProfileResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'profile-directory': Flags.directory({
      summary: messages.getMessage('flags.profile-directory.summary'),
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

  public async run(): Promise<ConvertProfileResult> {
    const { flags } = await this.parse(ConvertProfile);
    const inputFilesPath: string = flags['profile-directory'];
    const outputPath: string = flags['output-directory'];

    // test path for profiles
    const fileNames: string[] = fs.readdirSync(inputFilesPath);
    const profileFiles: string[] = fileNames.filter((name: string) => name.toLowerCase().endsWith(PROFILE_POSTFIX));
    if (!profileFiles || profileFiles.length === 0) {
      throw messages.createError('error.NoProfilesFound', [flags['profile-directory']]);
    }

    convertXMLToCSV(profileFiles, inputFilesPath, outputPath, FILE_TYPE.PROFILE);

    return {
      path: '/Users/henryzhao/Documents/papers-please/src/commands/convert/profile.ts',
    };
  }
}
