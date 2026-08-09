## How to publish

Run the complete release gate before starting the interactive publish step. It checks source lint,
strict public types, behavioral tests, production package builds, executable documentation and the
example application, then installs and exercises both packed tarballs in a temporary consumer.

```sh
npm run release
start-ssh-agent
npm run publish
```
