const DELIMITER: string = ',';

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

interface userPermission {
  enabled: boolean;
  name: string;
}

interface layoutAssignment {
  layout: string;
  recordType: string;
}

interface Map {
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

  jsonInput.forEach((entry) => {
    switch (entry.Type) {
      case 'fieldPermissions':
        filesToCreate.forEach((profile) => {
          if (!Object.keys((ret[profile] as Map)[jsonFileKey]).includes('fieldPermissions')) {
            ((ret[profile] as Map)[jsonFileKey] as Map)['fieldPermissions'] = [];
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
          (((ret[profile] as Map)[jsonFileKey] as Map)['fieldPermissions'] as fieldPermission[]).push(fieldPerm);
        });
        break;
      case 'userPermissions':
        filesToCreate.forEach((profile) => {
          if (!Object.keys((ret[profile] as Map)[jsonFileKey]).includes('userPermissions')) {
            ((ret[profile] as Map)[jsonFileKey] as Map)['userPermissions'] = [];
          }
          const layoutAssn: userPermission = {
            name: entry['Primary Value'],
            enabled: ['t', 'true'].includes(entry[profile].toLowerCase()),
          };
          (((ret[profile] as Map)[jsonFileKey] as Map)['userPermissions'] as userPermission[]).push(layoutAssn);
        });
        break;
      case 'layoutAssignments':
        filesToCreate.forEach((profile) => {
          if (!Object.keys((ret[profile] as Map)[jsonFileKey]).includes('layoutAssignments')) {
            ((ret[profile] as Map)[jsonFileKey] as Map)['layoutAssignments'] = [];
          }
          const layoutAssn: layoutAssignment = {
            layout: entry['Primary Value'],
            recordType: entry[profile],
          };
          (((ret[profile] as Map)[jsonFileKey] as Map)['layoutAssignments'] as layoutAssignment[]).push(layoutAssn);
        });
        break;
      case 'objectPermissions':
        filesToCreate.forEach((profile) => {
          if (entry[profile].toLowerCase() === 'skip') {
            return;
          }
          if (!Object.keys((ret[profile] as Map)[jsonFileKey]).includes('objectPermissions')) {
            ((ret[profile] as Map)[jsonFileKey] as Map)['objectPermissions'] = [];
          }
          const objPerm: objectPermission = {
            allowCreate: entry[profile].toLowerCase().includes('c'),
            allowDelete: entry[profile].toLowerCase().includes('d'),
            allowEdit: entry[profile].toLowerCase().includes('u'),
            allowRead: entry[profile].toLowerCase().includes('r'),
            modifyAllRecords: entry[profile].toLowerCase().includes('m'),
            viewAllRecords: entry[profile].toLowerCase().includes('v'),
            object: entry['Primary Value'],
          };
          (((ret[profile] as Map)[jsonFileKey] as Map)['objectPermissions'] as objectPermission[]).push(objPerm);
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
