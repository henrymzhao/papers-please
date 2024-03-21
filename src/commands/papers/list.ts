import {Flags, SfCommand} from '@salesforce/sf-plugins-core';
import {Connection, Messages} from '@salesforce/core';
import ListUtil from '../../util/listUtils.js';
import {FILE_TYPE} from '../../util/generateUtils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-papers-please', 'papers.list');

export type PapersListResult = {
    path: string;
};

export default class PapersList extends SfCommand<PapersListResult> {
    public static readonly summary = messages.getMessage('summary');
    public static readonly description = messages.getMessage('description');
    public static readonly examples = messages.getMessages('examples');

    public static readonly flags = {
        'target-org': Flags.requiredOrg({
            summary: messages.getMessage('flags.target-org.summary'),
            char: 'o',
            required: true,
        }),
        'output-directory': Flags.directory({
            summary: messages.getMessage('flags.output-directory.summary'),
            char: 'p',
            required: true,
        }),
        // type: Flags.string({
        //     summary: messages.getMessage('flags.type.summary'),
        //     char: 't',
        //     required: true,
        // }),
    };

    public async run(): Promise<PapersListResult> {
        const {flags} = await this.parse(PapersList);

        // disabling "type" flag because it seems only Profile is needed for now, perm set comes fully populated by default
        // const type: string = flags['type'];
        // if (!['Profile', 'PermissionSet'].includes(type)) {
        //     throw messages.createError('error.UnexpectedTypeFlag', [flags['permset-directory']]);
        // }
        const org: Connection = flags['target-org'].getConnection();
        const output: string = flags['output-directory'];

        // const inputType: FILE_TYPE = type === 'Profile' ? FILE_TYPE.PROFILE : FILE_TYPE.PERMSET;
        const util = new ListUtil(FILE_TYPE.PROFILE, org);

        const names: string[] = await util.grabMetadataNames();
        await util.grabMetadataFiles(names, output);

        return {
            path: '/Users/henryzhao/Documents/papers-please/src/commands/papers/list',
        };
    }
}
