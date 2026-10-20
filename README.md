# MailMigo

## Background

#### Product Outline

MailMigo is a Software-as-a-Service (SaaS) product targetted towards users who want to harness the power of AI without needing to leave the interfaces they are already familiar with, with a focus on email in particular. Users are able to invoke our service through sending or forwarding emails to preset MailMigo email addresses, which then process email content and respond as required.

#### Product Components

MailMigo has two central components.

- The first is the serverless architecture that supports mail actions via detecting incoming tasks, performing generations and sending emails in response.
- The second is a frontend web application which will act as a centralized platform for users to manage their content. Here, users will be able to view all documents processed by MailMigo, as well as generations (summaries, case studies, etc) generated in response to email invocations. It will also be where users register for the service, and manage other users in their organization.

These two components will work together in order to provide a seamless experience for users of the service.

## Contribution

### Workflow

The project was managed by Chad Rossouw, CTO of Migoverse (parent company). Communications were carried out through Discord/Slack and tasks managed through Jira.

### Git Flow

This project is hosted on Github and uses Git Flow standards. All contributions must abide by the following rules and are enforced with branch protections.

#### Feature Branches

- All features should be developed on feature branches checked out of the `dev` branch.

  - A feature branch should have a relevant and descriptive name directly corresponding to the feature developed, and follow a standardized format.
    - No caps.
    - Use `-` for spaces between words.
  - This can be done with `git checkout -b feature-name`

#### Merges to `dev`

All feature branches must be merged to `dev` via a Pull Request.

- All PRs must be reviewed and approved by at least one other team member.
- PRs can be merged through a merge commit or squash commit. Rebases are not permitted, as this can make undoing a merge difficult.
- Feature branches must pass automated tests before being merged.

#### Merges to `main`

Merges into `main` must be done via the use of a `release` branch. **The `dev` branch cannot be merged directly into `main`.**

- A release branch name must start with the pattern `release/`, for example: `release/1.1`.
- Release branches are used to make last-minute bug fixes, changes or updates to documentation before merging to main.
  - If such updates are made, the release branch should also be merged into `dev` immediately after being merged to `main`.
- Release branches are also required to be merged via a PR.
- Release branches must also pass automated tests before being merged.
- All release PRs will be merged via a 'squash' strategy with a standardised commit message of format `release [release_number]`. This means that `git log` of `main` will be composed exclusively of release commits, e.g `release 1.0`, `release 1.1`, `release 2.0`, etc.
- Undoing a release means undoing all commits in that release.

  - This is necessary to ensure that the live product, at any given time, must be perfectly functional.
  - This means not having any features which depend on other features which have been cherry-picked and removed, hence this requirement.

### Installation

In order to start working on MailMigo:

1. Clone and `cd` into the repository:

```
git clone https://github.com/alan-zhang39/mailmigo.git
cd mailmigo
```

2. Install project dependencies. This requires npm to be installed, if you don't have npm then follow [these instructions first](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

```bash
cd mailmigo
npm i
```

3. Install global dependencies needed for Angular / Firebase development.

```bash
npm i -g @angular/cli firebase-tools
```

Login to Firebase locally and follow CLI setup instructions. Note that this requires you to have a Firebase account. If you intend to perform Firebase tasks (e.g deployment), you **must** have write permissions on the Firebase project associated with the account you login to the CLI with. Ask Chad to grant permissions if you don't already have them.

```bash
firebase login
```

4. Running project

A variety of setup scripts have been configured in `package.json` to make it easy to run the project in different ways:

[NOT RECOMMENDED] Running frontend only via Angular. **DISCLAIMER:** This attempts to connect to a locally running database via Firebase emulators. If you do not have this running, the application will not work as expected.

```bash
npm run start
```

Running frontend only via Angular, but connected to development database:

```bash
npm run start-dev
```

#### Emulators

- This requires firebase CLI to be setup and for you to have logged in.
- If first time doing so, you must download the emulators. During setup wizard, **only accept defaults. Port settings, config, etc have been done in advance and are in `firebase.json`. Do not override.**

```bash
firebase init emulators
```

After setup:

Running emulators with state-preservation for auth, database and storage. State is cached in `.firebase/emulator-cache/`

```bash
npm run emulators
```

Running emulators cleanly (no cache). All datastores will be empty. Used for niche testing purposes.

```bash
npm run emulators-no-cache
```

Emulator UI will be available at [http:127.0.0.1:4000](http:127.0.0.1:4000). All other UIs can be accessed from there, including the Angular application available via the hosting emulator ([https:127.0.0.1:4201](https:127.0.0.1:4201))

### Deployment

Production and development deployments have separate realtime databases and storage, but share auth (accounts will share same IDs in production and in development databases).

#### Manual Deployments

Instructions to come. Firebase permissions are required.

### Development Environment

#### Angular File Excludes

For the sake of development ease, many prefer to hide the Angular auto-generated `.spec.ts` files in the project directory navigator. You can do so in VSCode through doing the following:

1. VSCode Ctrl-Shift-P
2. Search "files: exclude"
3. Add pattern `**/*.spec.ts`

#### Global GitIgnore

If you have not already done so, it is _highly_ recommended that you setup up a [global gitignore](https://stackoverflow.com/a/7335487) for your development device. While the project gitignore includes some general device-specific files (e.g `.DS_Store` on MacOS), I can't catch every edge case for every device. Please do not commit useless files that clutter the repo.
