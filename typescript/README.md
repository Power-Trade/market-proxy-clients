# PowerTrade Market Proxy TypeScript Client

A TypeScript/JavaScript client library for [PowerTrade's API](https://api-docs-5180b.web.app/)

Check out [TODO.md](/TODO.md) for project progress

## Setup

Install dependencies

```
$ yarn
```

## Run tests

```
$ yarn test
```

## Linting

```
$ yarn lint
```

## Code formatting

Code formatting is done through [prettier](https://prettier.io/).

It is recommended to use it through plugins, but there is a command available:

```
$ yarn format
```

## Commit messages

Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Commit messages should be chosen carefully as they will be used to generate release notes.

- For new features, use `feat: ` for example `feat: Add new awesome feature`
- For bug fixes, use `fix: ` for example `fix: Fix login error`
- For commits that should not be included in the release notes, use `chore: ` for example `chore: fix unit tests`

The 3 commits above would result in the following release notes:

```
### Features

* Add new awesome feature


### Bug Fixes

* Fix login error
```

Note: commit messages are linted with [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)

## Generate Release note

To update `CHANGELOG.md`, tag the release and bump the version in `package.json`:

```
$ yarn release
```

By default this will bump the 'minor' number of the version: `1.2.3` -> `1.3.0`

To bump the 'patch' number, use `yarn release:patch`: `1.2.3` -> `1.2.4`

To set an arbitrary new version, use `yarn release -- --release-as 2.2.2`
