/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from 'node:fs';
import path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { parseString } from 'xml2js';
import { DELIMITER, Map } from '../../../util/generateUtils.js';
import { PROFILE_POSTFIX } from '../../../util/constants.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('papers-please', 'convert.profile');

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
    let outputCSV: string = '';

    // test path for profiles
    const fileNames: string[] = fs.readdirSync(inputFilesPath);
    const profileFiles: string[] = fileNames.filter((name: string) => name.toLowerCase().endsWith(PROFILE_POSTFIX));
    if (!profileFiles || profileFiles.length === 0) {
      throw messages.createError('error.NoProfilesFound', [flags['profile-directory']]);
    }

    // begin reading profiles into json
    const profileNames: string[] = [];
    const masterJson: Map = {};
    profileFiles.forEach((profile) => {
      const profileName: string = profile.split(PROFILE_POSTFIX)[0];
      profileNames.push(profileName);
      const xmlContent: string = fs.readFileSync(path.join(inputFilesPath, profile), { encoding: 'utf-8' });

      let readJson: Map = {};
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      parseString(xmlContent, (err, res: Map) => {
        readJson = res;
      });
      // this.logJson(readJson);

      const attributeTypes = Object.keys(readJson['Profile']).filter((key: string) => key !== '$');
      attributeTypes.forEach((attribute: string) => {
        if (!Object.keys(masterJson).includes(attribute)) {
          masterJson[attribute] = {};
        }
        // eslint-disable-next-line complexity
        Object.values((readJson['Profile'] as Map)[attribute]).forEach((primaryVal: Map | string) => {
          let primaryValue: string = '';
          let accessLevel = '';
          switch (attribute) {
            case 'fieldPermissions':
              primaryValue = primaryVal as Map['field'] as string[][0];
              accessLevel += (primaryVal as Map['readable'] as string[][0]) === 'true' ? 'R' : '';
              accessLevel += (primaryVal as Map['editable'] as string[][0]) === 'true' ? 'W' : '';
              break;
            case 'userPermissions':
              primaryValue = primaryVal as Map['name'] as string[][0];
              accessLevel += (primaryVal as Map['enabled'] as string[][0]) === 'true' ? 'T' : 'F';
              break;
            case 'layoutAssignments':
              primaryValue = primaryVal as Map['layout'] as string[][0];
              accessLevel += primaryVal as Map['recordType'] as string[][0];
              break;
            case 'tabVisibilities':
              primaryValue = primaryVal as Map['tab'] as string[][0];
              accessLevel += (primaryVal as Map['visibility'] as string[][0]).toLowerCase() === 'defaulton' ? 'T' : 'F';
              break;
            case 'classAccesses':
              primaryValue = primaryVal as Map['apexClass'] as string[][0];
              accessLevel += (primaryVal as Map['enabled'] as string[][0]) === 'true' ? 'T' : 'F';
              break;
            case 'recordTypeVisibilities':
              primaryValue = primaryVal as Map['recordType'] as string[][0];
              if ((primaryVal as Map['default'] as string[][0]) === 'true') {
                accessLevel = 'Default';
              } else {
                accessLevel = (primaryVal as Map['visible'] as string[][0]) === 'true' ? 'T' : 'F';
              }
              break;
            case 'userLicense':
              primaryValue = 'userLicense';
              accessLevel = primaryVal as string;
              break;
            case 'custom':
              primaryValue = 'custom';
              accessLevel = (primaryVal as string).toLowerCase() === 'true' ? 'T' : 'F';
              break;
            case 'objectPermissions':
              primaryValue = primaryVal as Map['object'] as string[][0];
              // eslint-disable-next-line no-case-declarations
              let basicAccess: string = '';
              // eslint-disable-next-line no-case-declarations
              let adminAccess: string = '';
              basicAccess += (primaryVal as Map['allowCreate'] as string[][0]) === 'true' ? 'C' : '';
              basicAccess += (primaryVal as Map['allowRead'] as string[][0]) === 'true' ? 'R' : '';
              basicAccess += (primaryVal as Map['allowEdit'] as string[][0]) === 'true' ? 'U' : '';
              basicAccess += (primaryVal as Map['allowDelete'] as string[][0]) === 'true' ? 'D' : '';
              adminAccess += (primaryVal as Map['modifyAllRecords'] as string[][0]) === 'true' ? 'M' : '';
              adminAccess += (primaryVal as Map['viewAllRecords'] as string[][0]) === 'true' ? 'V' : '';
              accessLevel = [basicAccess, adminAccess].filter(Boolean).join('+');
              break;
          }
          if (!(masterJson[attribute] as Map)[primaryValue]) {
            (masterJson[attribute] as Map)[primaryValue] = {};
          }
          ((masterJson[attribute] as Map)[primaryValue] as Map)[profileName] = accessLevel;
        });
      });
    });

    // write the CSV headers
    const headers = ['Type', 'Primary Value', ...profileNames];
    outputCSV += headers.join(DELIMITER) + '\n';

    // construct final CSV
    Object.keys(masterJson).forEach((type: string) => {
      Object.keys(masterJson[type] as Map).forEach((primaryValue: string) => {
        const accessLevels: string[] = profileNames.map(
          (profile) => (((masterJson[type] as Map)[primaryValue] as Map)[profile] as string) || 'skip'
        );
        const line = [type, primaryValue, ...accessLevels];
        outputCSV += line.join(DELIMITER) + '\n';
      });
    });

    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(path.join(outputPath, 'testing.csv'), outputCSV);

    return {
      path: '/Users/henryzhao/Documents/papers-please/src/commands/convert/profile.ts',
    };
  }
}
