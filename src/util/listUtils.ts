import fs from 'node:fs';
import path from 'node:path';
import { Connection } from '@salesforce/core';
import { Builder } from 'xml2js';
import { FILE_TYPE } from './generateUtils.js';
import { PERMSET_POSTFIX, PROFILE_POSTFIX } from './constants.js';

export default class ListUtil {
  public fileType: FILE_TYPE;
  public org: Connection;
  private readonly type: string;
  private readonly postfix: string;

  public constructor(fileType: FILE_TYPE, org: Connection) {
    this.fileType = fileType;
    this.org = org;
    this.type = fileType === FILE_TYPE.PROFILE ? 'Profile' : 'PermissionSet';
    this.postfix = fileType === FILE_TYPE.PROFILE ? PROFILE_POSTFIX : PERMSET_POSTFIX;
  }

  public async grabMetadataNames(): Promise<string[]> {
    const retrievedMetadata = await this.org.metadata.list([{ type: this.type }]);
    return retrievedMetadata.map((metadata) => metadata.fileName.split('/')[1].split('.')[0]);
  }

  public async grabMetadataFiles(fileNames: string[], outputPath: string): Promise<void> {
    const perChunk = 10; // limit by salesforce api
    const chunkedNames: string[][] = fileNames.reduce((resultArray: string[][], item: string, index) => {
      const chunkIndex = Math.floor(index / perChunk);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }
      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []);

    // @ts-expect-error eslint freaking out about file type being a string
    const promises = chunkedNames.map((name) => this.org.metadata.read(this.type, name));
    const readFiles = (await Promise.all(promises)).flat(1);

    fs.mkdirSync(outputPath, { recursive: true });
    readFiles.forEach((file) => {
      fs.writeFileSync(
        path.join(outputPath, `${file.fullName}${this.postfix}`),
        new Builder({
          xmldec: {
            version: '1.0',
            encoding: 'UTF-8',
          },
          rootName: this.type,
          renderOpts: {
            pretty: true,
            indent: '    ', // 4 spaces
            newline: '\n',
          },
        }).buildObject({
          ...file,
          ...{
            $: {
              xmlns: 'http://soap.sforce.com/2006/04/metadata',
            },
          },
        })
      );
    });
  }
}
