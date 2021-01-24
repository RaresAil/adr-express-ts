/* eslint-disable security/detect-child-process */
/* eslint-disable no-console */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const options = require('./testing-config.json');

(() => {
  const env = path.join(__dirname, options.location);
  const localLib = path.join(__dirname, '..', 'lib');
  const envSrc = path.join(env, 'src');

  const log = console.log;

  const cleanEnv = () => {
    if (fs.existsSync(env)) {
      fs.rmdirSync(env, {
        recursive: true
      });
    }
  };

  const replaceFilesInDir = (location) => {
    fs.readdirSync(location).map((directoryItem) => {
      const itemPath = path.join(location, directoryItem);

      const isDir = fs.lstatSync(itemPath).isDirectory();
      if (isDir) {
        replaceFilesInDir(itemPath);
        return;
      }

      const fileName = path.basename(itemPath);
      if (!fileName.endsWith('.ts')) {
        return;
      }

      fs.writeFileSync(
        itemPath,
        fs
          .readFileSync(itemPath, {
            encoding: 'utf8'
          })
          .replace(/adr\-express\-ts\/lib/gm, localLib)
          .replace(/\'adr\-express\-ts\'/gm, `'${localLib}'`)
      );
    });
  };

  cleanEnv();
  log(execSync(`git clone ${options.source} "${env}"`).toString('utf8'));
  log(execSync(`cd "${env}" && yarn`).toString('utf8'));

  replaceFilesInDir(envSrc);

  log(execSync(`cd "${env}" && yarn test`).toString('utf8'));
  cleanEnv();
})();
