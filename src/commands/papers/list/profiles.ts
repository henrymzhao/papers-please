

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url)
const messages = Messages.loadMessages('sfdx-papers-please', 'papers.list.profiles');

export type PapersListProfilesResult = {
  path: string;
};

export default class PapersListProfiles extends SfCommand<PapersListProfilesResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    name: Flags.string({
      summary: messages.getMessage('flags.name.summary'),
      description: messages.getMessage('flags.name.description'),
      char: 'n',
      required: false,
    }),
  };

  public async run(): Promise<PapersListProfilesResult> {
    const { flags } = await this.parse(PapersListProfiles);

    const name = flags.name ?? 'world';
    this.log(`hello ${name} from /Users/henryzhao/Documents/papers-please/src/commands/papers/list/profiles.ts`);
    return {
      path: '/Users/henryzhao/Documents/papers-please/src/commands/papers/list/profiles.ts',
    };
  }
}
