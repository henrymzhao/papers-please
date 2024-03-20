export const DELIMITER: string = ',';

interface fieldPermission {
  editable: boolean;
  field: string;
  readable: boolean;
}

interface objectPermission {
  allowCreate: boolean;
  allowDelete: boolean;
  allowEdit: boolean;
  allowRead: boolean;
  modifyAllRecords: boolean;
  object: string;
  viewAllRecords: boolean;
}

interface genericNameEnablement {
  enabled: boolean;
  name: string;
}

interface layoutAssignment {
  layout: string;
  recordType: string;
}

interface tabVisibility {
  tab: string;
  visibility: string;
}

interface recordTypeVisibility {
  default?: boolean;
  recordType: string;
  visible: boolean;
}

interface classAccess {
  enabled: boolean;
  apexClass: string;
}

export interface Map {
  [key: string]: string | ThisType<this> | string[];
}

export function csvToJson(csvInput: string): Array<Record<string, string>> {
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

export function getFileNames(entry: object): string[] {
  const keys = Object.keys(entry);
  return keys.filter((key) => key !== 'Type' && key !== 'Primary Value');
}

export enum FILE_TYPE {
  PROFILE,
  PERMSET,
}

export function mapCsvToJSON(
  jsonInput: Array<Record<string, string>>,
  filesToCreate: string[],
  fileType: FILE_TYPE
): Map {
  const ret: Map = {};

  filesToCreate.forEach((fileName: string) => {
    if (fileType === FILE_TYPE.PROFILE) {
      ret[fileName] = profileFactory();
    } else {
      ret[fileName] = permSetFactory();
    }
  });

  const jsonFileKey: string = fileType === FILE_TYPE.PROFILE ? 'Profile' : 'PermissionSet';

  jsonInput.sort().forEach((entry) => {
    switch (entry.Type) {
      case 'fieldPermissions':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes('fieldPermissions')) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)['fieldPermissions'] = [];
          }
          const fieldPerm: fieldPermission = {
            editable: false,
            field: entry['Primary Value'],
            readable: false,
          };
          if (entry[fileName].includes('W')) {
            fieldPerm.editable = true;
          }
          if (entry[fileName].includes('R')) {
            fieldPerm.readable = true;
          }
          (((ret[fileName] as Map)[jsonFileKey] as Map)['fieldPermissions'] as fieldPermission[]).push(fieldPerm);
        });
        break;
      case 'recordTypeVisibilities':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes('recordTypeVisibilities')) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)['recordTypeVisibilities'] = [];
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const recordTypeVis: recordTypeVisibility = {};
          // only profiles have this attribute
          if (fileType === FILE_TYPE.PROFILE) {
            recordTypeVis.default = ['default', 'd'].includes(entry[fileName].toLowerCase());
          }
          // doing this way to maintain the order of the keys in the generated XML doc (e.g. default always comes first)
          recordTypeVis.recordType = entry['Primary Value'];
          recordTypeVis.visible = ['t', 'true', 'default', 'd'].includes(entry[fileName].toLowerCase());

          (((ret[fileName] as Map)[jsonFileKey] as Map)['recordTypeVisibilities'] as recordTypeVisibility[]).push(
            recordTypeVis
          );
        });
        break;
      case 'customPermissions':
      case 'customMetadataTypeAccesses':
      case 'userPermissions':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes(entry.Type)) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)[entry.Type] = [];
          }
          const layoutAssn: genericNameEnablement = {
            name: entry['Primary Value'],
            enabled: ['t', 'true'].includes(entry[fileName].toLowerCase()),
          };
          (((ret[fileName] as Map)[jsonFileKey] as Map)[entry.Type] as genericNameEnablement[]).push(layoutAssn);
        });
        break;
      case 'classAccesses':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes('classAccesses')) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)['classAccesses'] = [];
          }
          const apexClass: classAccess = {
            apexClass: entry['Primary Value'],
            enabled: ['t', 'true'].includes(entry[fileName].toLowerCase()),
          };
          (((ret[fileName] as Map)[jsonFileKey] as Map)['classAccesses'] as classAccess[]).push(apexClass);
        });
        break;
      case 'layoutAssignments':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes('layoutAssignments')) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)['layoutAssignments'] = [];
          }
          const layoutAssn: layoutAssignment = {
            layout: entry['Primary Value'],
            recordType: entry[fileName],
          };
          (((ret[fileName] as Map)[jsonFileKey] as Map)['layoutAssignments'] as layoutAssignment[]).push(layoutAssn);
        });
        break;
      case 'tabSettings':
      case 'tabVisibilities':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes(entry.Type)) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)[entry.Type] = [];
          }
          const tabVis: tabVisibility = {
            tab: entry['Primary Value'],
            visibility: entry[fileName],
          };
          (((ret[fileName] as Map)[jsonFileKey] as Map)[entry.Type] as tabVisibility[]).push(tabVis);
        });
        break;
      case 'objectPermissions':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          if (!Object.keys((ret[fileName] as Map)[jsonFileKey]).includes('objectPermissions')) {
            ((ret[fileName] as Map)[jsonFileKey] as Map)['objectPermissions'] = [];
          }
          const objPerm: objectPermission = {
            allowCreate: entry[fileName].toLowerCase().includes('c'),
            allowDelete: entry[fileName].toLowerCase().includes('d'),
            allowEdit: entry[fileName].toLowerCase().includes('u'),
            allowRead: entry[fileName].toLowerCase().includes('r'),
            modifyAllRecords: entry[fileName].toLowerCase().includes('m'),
            object: entry['Primary Value'],
            viewAllRecords: entry[fileName].toLowerCase().includes('v'),
          };
          (((ret[fileName] as Map)[jsonFileKey] as Map)['objectPermissions'] as objectPermission[]).push(objPerm);
        });
        break;
      case 'userLicense':
      case 'description':
      case 'license':
      case 'hasActivationRequired':
      case 'label':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          ((ret[fileName] as Map)[jsonFileKey] as Map)[entry.Type] = entry[fileName];
        });
        break;
      case 'custom':
        filesToCreate.forEach((fileName) => {
          if (entry[fileName].toLowerCase() === '-') {
            return;
          }
          ((ret[fileName] as Map)[jsonFileKey] as Map)['custom'] = ['t', 'true'].includes(entry[fileName].toLowerCase())
            ? 'true'
            : 'false';
        });
        break;
    }
  });

  return ret;
}

function profileFactory(): Map {
  return {
    Profile: {
      '@xmlns': 'http://soap.sforce.com/2006/04/metadata',
    },
  };
}

function permSetFactory(): Map {
  return {
    PermissionSet: {
      '@xmlns': 'http://soap.sforce.com/2006/04/metadata',
    },
  };
}
