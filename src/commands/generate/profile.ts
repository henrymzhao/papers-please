/* eslint-disable class-methods-use-this */
import fs from 'node:fs';
import path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import json2xml from '../../util/json2xml.js';

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
    'output-directory': Flags.directory({
      summary: messages.getMessage('flags.output-directory.summary'),
      char: 'p',
      required: true,
    }),
  };

  private static getProfiles(entry: object): string[] {
    const keys = Object.keys(entry);
    return keys.filter((key) => key !== 'Type' && key !== 'Primary Value');
  }

  public async run(): Promise<GenerateProfileResult> {
    const { flags } = await this.parse(GenerateProfile);

    const csvPath: string = flags['csv-file'];
    const outputPath: string = flags['output-directory'];

    const csvInput: string = fs.readFileSync(csvPath, {
      encoding: 'utf-8',
    });
    const rawJsonConversion: Array<Record<string, string>> = this.csvToJson(csvInput);
    const profilesToCreate = GenerateProfile.getProfiles(rawJsonConversion[0]);
    const preppedJsonForConversion = this.prepJsonForConversion(rawJsonConversion, profilesToCreate);

    profilesToCreate.forEach((profile) => {
      const profileData = preppedJsonForConversion[profile];
      fs.mkdirSync(outputPath, { recursive: true });
      fs.writeFileSync(
        path.join(outputPath, `${profile}.profile-meta.xml`),
        '<?xml version="1.0" encoding="UTF-8"?>\n' + json2xml(profileData)
      );
    });

    return {
      success: false,
    };
  }

  private prepJsonForConversion(jsonInput: Array<Record<string, string>>, profilesToCreate: string[]): Map {
    const ret: Map = {};

    profilesToCreate.forEach((profile: string) => {
      ret[profile] = this.profileFactory();
    });

    jsonInput.forEach((entry) => {
      switch (entry.Type) {
        case 'fieldPermissions':
          profilesToCreate.forEach((profile) => {
            if (!Object.keys((ret[profile] as Map)['Profile']).includes('fieldPermissions')) {
              ((ret[profile] as Map)['Profile'] as Map)['fieldPermissions'] = [];
            }
            const fieldPerm: fieldPermission = {
              field: entry['Primary Value'],
              editable: false,
              readable: false,
            };
            if (entry[profile].includes('W')) {
              fieldPerm.editable = true;
            }
            if (entry[profile].includes('R')) {
              fieldPerm.readable = true;
            }
            (((ret[profile] as Map)['Profile'] as Map)['fieldPermissions'] as fieldPermission[]).push(fieldPerm);
          });
          break;
        case 'userPermissions':
          break;
      }
    });

    return ret;
  }

  private profileFactory(): Map {
    return {
      Profile: {
        '@xmlns': 'http://soap.sforce.com/2006/04/metadata',
      },
    };
  }

  private csvToJson(csvInput: string): Array<Record<string, string>> {
    const lines = csvInput.split('\n');

    const res: Array<Record<string, string>> = [];

    const headers: string[] = lines[0].split(DELIMITER).map((val) => val.trim());

    for (let i = 1; i < lines.length; i++) {
      const obj: Record<string, string> = {};
      const curLine = lines[i].split(DELIMITER);

      curLine.forEach((cell, index) => {
        obj[headers[index]] = cell.trim();
      });
      res.push(obj);
    }
    return res;
  }
}

interface fieldPermission {
  editable: boolean;
  field: string;
  readable: boolean;
}

interface Map {
  [key: string]: string | ThisType<this> | string[];
}
