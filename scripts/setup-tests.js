/* eslint-disable security/detect-child-process */
/* eslint-disable no-console */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const options = require('./testing-config.json');

(() => {
  const testLocation = path.join(__dirname, options.location);
  const localLib = path.join(__dirname, '..', 'lib');
  const testLocationSrc = path.join(testLocation, 'src');

  const log = console.log;

  const clean = () => {
    try {
      if (fs.existsSync(testLocation)) {
        log('Cleaning.');
        fs.rmSync(testLocation, {
          recursive: true,
          force: true
        });
      }
    } catch {}
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
          .replace(/\@adr\-express\-ts\/core\/lib/gm, localLib)
          .replace(/\'\@adr\-express\-ts\/core\'/gm, `'${localLib}'`)
      );
    });
  };

  clean();
  log(
    execSync(`git clone ${options.source} "${testLocation}"`).toString('utf8')
  );
  log(execSync(`cd "${testLocation}" && yarn`).toString('utf8'));

  replaceFilesInDir(testLocationSrc);

  log(execSync(`cd "${testLocation}" && yarn test`).toString('utf8'));
  clean();
})();
