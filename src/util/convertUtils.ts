/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fs from 'node:fs';
import path from 'node:path';
import {parseString} from 'xml2js';
import {DELIMITER, FILE_TYPE, Map} from './generateUtils.js';
import {PERMSET_POSTFIX, PROFILE_POSTFIX} from './constants.js';

export function convertXMLToCSV(xmlFileNames: string[], inputPath: string, outputPath: string, fileType: FILE_TYPE): void {
    const fileTypeName = fileType === FILE_TYPE.PROFILE ? 'Profile' : 'PermissionSet';
    // begin reading files into json
    const fileNames: string[] = [];
    const masterJson: Map = {};
    xmlFileNames.forEach((file) => {
        const fileName: string = file.split(fileType === FILE_TYPE.PROFILE ? PROFILE_POSTFIX : PERMSET_POSTFIX)[0];
        fileNames.push(fileName);
        const xmlContent: string = fs.readFileSync(path.join(inputPath, file), {encoding: 'utf-8'});

        let readJson: Map = {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        parseString(xmlContent, (err, res: Map) => {
            readJson = res;
        });

        const attributeTypes = Object.keys(readJson[fileTypeName]).filter((key: string) => key !== '$');

        attributeTypes.forEach((attribute: string) => {
            if (!Object.keys(masterJson).includes(attribute)) {
                masterJson[attribute] = {};
            }

            /* eslint-disable  @typescript-eslint/no-explicit-any */
            // eslint-disable-next-line complexity
            Object.values((readJson[fileTypeName] as Map)[attribute]).forEach((primaryVal: any) => {
                let primaryValue: string = '';
                let accessLevel: string = '';
                switch (attribute) {
                    case 'fieldPermissions':
                        primaryValue = primaryVal['field'][0] as string;
                        accessLevel += (primaryVal['readable'][0]) === 'true' ? 'R' : '';
                        accessLevel += (primaryVal['editable'][0]) === 'true' ? 'W' : '';
                        break;
                    case 'customPermissions':
                    case 'userPermissions':
                        primaryValue = primaryVal['name'][0] as string;
                        accessLevel += (primaryVal['enabled'][0]);
                        break;
                    case 'layoutAssignments':
                        primaryValue = primaryVal['layout'][0] as string;
                        accessLevel += primaryVal['recordType'][0];
                        break;
                    case 'tabSettings':
                    case 'tabVisibilities':
                        primaryValue = primaryVal['tab'][0] as string;
                        accessLevel += primaryVal['visibility'][0] as string;
                        break;
                    case 'classAccesses':
                        primaryValue = primaryVal['apexClass'][0] as string;
                        accessLevel += (primaryVal['enabled'][0]);
                        break;
                    case 'recordTypeVisibilities':
                        primaryValue = primaryVal['recordType'][0] as string;
                        if (primaryVal['default']?.[0] && primaryVal['default'][0] === 'true') {
                            accessLevel = 'Default';
                        } else {
                            accessLevel = primaryVal['visible'][0] as string;
                        }
                        break;
                    case 'label':
                    case 'license':
                    case 'description':
                    case 'userLicense':
                    case 'custom':
                    case 'hasActivationRequired':
                        primaryValue = attribute;
                        accessLevel = ['t', 'true', 'f', 'false'].includes((primaryVal as unknown as string).toLowerCase()) ?
                            (primaryVal as unknown as string).toLowerCase() : primaryVal as unknown as string
                        break;
                    case 'objectPermissions':
                        primaryValue = primaryVal['object'][0] as string;
                        // eslint-disable-next-line no-case-declarations
                        let basicAccess: string = '';
                        // eslint-disable-next-line no-case-declarations
                        let adminAccess: string = '';
                        basicAccess += (primaryVal['allowCreate'][0]) === 'true' ? 'C' : '';
                        basicAccess += (primaryVal['allowRead'][0]) === 'true' ? 'R' : '';
                        basicAccess += (primaryVal['allowEdit'][0]) === 'true' ? 'U' : '';
                        basicAccess += (primaryVal['allowDelete'][0]) === 'true' ? 'D' : '';
                        adminAccess += (primaryVal['modifyAllRecords'][0]) === 'true' ? 'M' : '';
                        adminAccess += (primaryVal['viewAllRecords'][0]) === 'true' ? 'V' : '';
                        accessLevel = [basicAccess, adminAccess].filter(Boolean).join('+');
                        break;
                }
                if (!(masterJson[attribute] as Map)[primaryValue]) {
                    (masterJson[attribute] as Map)[primaryValue] = {};
                }
                ((masterJson[attribute] as Map)[primaryValue] as Map)[fileName] = accessLevel;
            });
        });
    });

    // write the CSV headers
    let outputCSV: string = '';
    const headers = ['Type', 'Primary Value', ...fileNames];
    outputCSV += headers.join(DELIMITER) + '\n';

    // construct final CSV
    Object.keys(masterJson).forEach((type: string) => {
        Object.keys(masterJson[type] as Map).forEach((primaryValue: string) => {
            const accessLevels: string[] = fileNames.map(
                (file) => (((masterJson[type] as Map)[primaryValue] as Map)[file] as string) || '-'
            );
            const line = [type, primaryValue, ...accessLevels];
            outputCSV += line.join(DELIMITER) + '\n';
        });
    });

    fs.mkdirSync(outputPath, {recursive: true});
    fs.writeFileSync(path.join(outputPath, 'testing.csv'), outputCSV);
}