import fs from 'node:fs';
import {Flags, SfCommand} from '@salesforce/sf-plugins-core';
import {Messages} from '@salesforce/core';
import {PERMSET_POSTFIX} from '../../../util/constants.js';
import {convertXMLToCSV} from '../../../util/convertUtils.js';
import {FILE_TYPE} from '../../../util/generateUtils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url)
const messages = Messages.loadMessages('papers-please', 'papers.convert.permset');

export type PapersConvertPermsetResult = {
    path: string;
};

export default class PapersConvertPermset extends SfCommand<PapersConvertPermsetResult> {
    public static readonly summary = messages.getMessage('summary');
    public static readonly description = messages.getMessage('description');
    public static readonly examples = messages.getMessages('examples');

    public static readonly flags = {
        'permset-directory': Flags.directory({
            summary: messages.getMessage('flags.permset-directory.summary'),
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

    public async run(): Promise<PapersConvertPermsetResult> {
        const {flags} = await this.parse(PapersConvertPermset);
        const inputFilesPath: string = flags['permset-directory'];
        const outputPath: string = flags['output-directory'];

        // test path for profiles
        const fileNames: string[] = fs.readdirSync(inputFilesPath);
        const permSetFiles: string[] = fileNames.filter((name: string) => name.toLowerCase().endsWith(PERMSET_POSTFIX));
        if (!permSetFiles || permSetFiles.length === 0) {
            throw messages.createError('error.NoPermSetsFound', [flags['permset-directory']]);
        }

        convertXMLToCSV(permSetFiles, inputFilesPath, outputPath, FILE_TYPE.PERMSET);
        return {
            path: '/Users/henryzhao/Documents/papers-please/src/commands/papers/convert/permset.ts',
        };
    }
}
