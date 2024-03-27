import fs from 'node:fs';
import path from 'node:path';
import {SfCommand, Flags} from '@salesforce/sf-plugins-core';
import {Messages} from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-papers-please', 'papers.sample');

export type PapersSampleResult = {
    path: string;
};

export default class PapersSample extends SfCommand<PapersSampleResult> {
    public static readonly summary = messages.getMessage('summary');
    public static readonly description = messages.getMessage('description');
    public static readonly examples = messages.getMessages('examples');

    public static readonly flags = {
        'output-directory': Flags.directory({
            summary: messages.getMessage('flags.output-directory.summary'),
            char: 'p',
            required: true,
        }),
    };

    public async run(): Promise<PapersSampleResult> {
        const {flags} = await this.parse(PapersSample);

        const output = flags['output-directory'];
        fs.mkdirSync(output, {recursive: true});
        fs.copyFileSync(path.join('sample', 'SampleProfileInput.csv'), path.join(output, 'SampleProfiles.csv'))

        return {
            path: '/Users/henryzhao/Documents/papers-please/src/commands/papers/sample.ts',
        };
    }
}
