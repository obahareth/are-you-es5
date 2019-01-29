const {
  exec
} = require('child_process');

const path = require("path")

// TODO: Read this from commandline
const logEs5Packages = true;
const nodeModulesDir = path.join(__dirname, '../', 'node_modules');
const packageJsonDir = path.join(__dirname, '../');

let rootPackageJson = require(`${packageJsonDir}/package.json`);
let dependencies = Object.keys(rootPackageJson.dependencies);

dependencies.forEach(dep => {
  let packagePath = path.join(nodeModulesDir, dep)
  let packageJson = require(path.join(packagePath, 'package.json'))
  let mainScriptPath = path.join(packagePath, packageJson.main)

  exec(`es-check es5 ${mainScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      if (error.message.includes('ES version matching errors')) {
        console.log(`❌ ${dep} is not ES5`)
      }

      // node couldn't execute the command
      else {
        console.error(error);
      }

      return;
    }

    if (logEs5Packages) {
      console.log(`✅ ${dep} is ES5`)
    }
  });
})