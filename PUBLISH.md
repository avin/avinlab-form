## How to publish

Run the complete release gate before starting the interactive publish step. It checks source lint,
strict public types, behavioral tests, production package builds, executable documentation and the
example application.

`npm run release` performs local verification. The separate `npm run publish` command is the
irreversible registry publication step.

```sh
npm run release
start-ssh-agent
npm run publish
```
