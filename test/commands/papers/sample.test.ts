// import { TestContext } from '@salesforce/core/lib/testSetup.js';
// import { expect } from 'chai';
// import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
// import PapersSample from '../../../src/commands/papers/sample.js';
//
// describe('papers sample', () => {
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
//     await PapersSample.run([]);
//     const output = sfCommandStubs.log
//       .getCalls()
//       .flatMap((c) => c.args)
//       .join('\n');
//     expect(output).to.include('hello world');
//   });
//
//   it('runs hello with --json and no provided name', async () => {
//     const result = await PapersSample.run([]);
//     expect(result.path).to.equal('/Users/henryzhao/Documents/papers-please/src/commands/papers/sample.ts');
//   });
//
//   it('runs hello world --name Astro', async () => {
//     await PapersSample.run(['--name', 'Astro']);
//     const output = sfCommandStubs.log
//       .getCalls()
//       .flatMap((c) => c.args)
//       .join('\n');
//     expect(output).to.include('hello Astro');
//   });
// });
