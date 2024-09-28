Created using

```sh
npm install -g zkapp-cli
zk example
> sudoku
```

Then, turned into a ZkProgram, following [the docs](https://docs.minaprotocol.com/zkapps/o1js/recursion#example-recursively-verify-a-simple-program-in-a-zkapp)

see how to use in [sudokuProgram.test.ts](./src/sudokuProgram.test.ts)

Run tests with

```sh
npm run test
```

**_Note_**  
There is a `proofsEnabled` parameter, which is used to bypass the proof checks during development, tests still take a long time even with this.
