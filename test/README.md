# Automated tests

## Creating tests

Test files should follow the same structure as the source code files. For
example, if you have a file called `src/unit/flow.ts`, you should have a
corresponding test file called `test/unit/flow.spec.ts`.

Mocks should be added to the `test/mocks` directory.

## Running tests

To run the tests, use the following command:

```bash
pnpm test
```
