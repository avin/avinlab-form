## How to publish

Run the complete release gate before starting the interactive publish step. It checks source lint,
strict public types, behavioral tests, production package builds, executable documentation and the
example application, then installs and exercises both packed tarballs in a temporary consumer.
The packed-consumer output records bundle bytes and direct dependency counts as diagnostic data;
these measurements are not pass/fail size targets.

The latest V5 artifact verification recorded the following production output:

| Package               | ESM bytes | CommonJS bytes | Runtime dependencies | Peer dependencies |
| --------------------- | --------: | -------------: | -------------------: | ----------------: |
| `@avinlab/form`       |     6,470 |          7,569 |                    1 |                 0 |
| `@avinlab/react-form` |     4,452 |          6,334 |                    1 |                 2 |

`npm run release` only verifies locally produced tarballs. The separate `npm run publish` command
is the irreversible registry publication step.

```sh
npm run release
start-ssh-agent
npm run publish
```
