// import { TestContext } from '@salesforce/core/lib/testSetup.js';
// import { expect } from 'chai';
// import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
// import PapersList from '../../../src/commands/papers/list.js';
//
// describe('papers list', () => {
//   const $$ = new TestContext();
//   let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;
//
//   beforeEach(() => {
//     sfCommandStubs = stubSfCommandUx($$.SANDBOX);
//   });
//
//   afterEach(() => {
//     $$.restore();
//   });
//
//   it('runs hello', async () => {
//     await PapersList.run([]);
//     const output = sfCommandStubs.log
//       .getCalls()
//       .flatMap((c) => c.args)
//       .join('\n');
//     expect(output).to.include('hello world');
//   });
//
//   it('runs hello with --json and no provided name', async () => {
//     const result = await PapersList.run([]);
//     expect(result.path).to.equal('/Users/henryzhao/Documents/papers-please/src/commands/papers/list.ts');
//   });
//
//   it('runs hello world --name Astro', async () => {
//     await PapersList.run(['--name', 'Astro']);
//     const output = sfCommandStubs.log
//       .getCalls()
//       .flatMap((c) => c.args)
//       .join('\n');
//     expect(output).to.include('hello Astro');
//   });
// });
