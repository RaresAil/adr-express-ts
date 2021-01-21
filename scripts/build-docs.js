const fse = require('fs-extra');
const path = require('path');
const fs = require('fs');

const { version, name } = require('../package.json');

const docsLocation = path.join(process.cwd(), 'docs');
const location = path.join(docsLocation, name, version);
const styleFile = path.join(location, 'styles', 'jsdoc-default.css');

// const imagesToCopy = ['cli-q-2.png', 'cli-q-3.png', 'cli-q-final.png'];

(() => {
  if (!fs.existsSync(location)) {
    throw new Error('Unable to find the location of the docs!');
  }

  // imagesToCopy.forEach((image) => {
  //   fs.copyFileSync(path.join(root, image), path.join(location, image));
  // });

  fs.appendFileSync(
    styleFile,
    `
img {
  max-width: 100%;
}
  `
  );

  fse.copySync(location, docsLocation);
  fse.removeSync(path.join(docsLocation, name));
})();
