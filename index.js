#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const spawn = require("cross-spawn");
const stdin = process.openStdin();
const { stdout } = process;

const argv = yargs(hideBin(process.argv))
  .command("$0", "", (yargs) =>
    yargs
      .positional("project-name", {
        description: "The project name.",
        type: "string",
      })
      .usage("$0 <project-name>")
  )
  .help()
  .alias("help", "h").argv;

const {
  _: [name],
} = argv;

const main = async () => {
  const root = path.resolve(name);
  let appName = path.basename(root);

  const answer = await askQuestion(`Enter project name [${appName}]:`);
  if (answer !== "") {
    appName = answer;
  }

  console.log(
    chalk.green("i"),
    `Creating REST API "${chalk.green(appName)}" in ${chalk.green(root)}.`
  );

  fs.ensureDirSync(name);

  const content = fs.readdirSync(root);
  if (content.length > 0) {
    console.log(
      `${chalk.yellow("WARNING:")} The directory ${chalk.green(
        root
      )} is not empty.`
    );
    const answer = await askQuestion("Do you want to continue? [y/N]");
    if (isDefaultNo(answer)) {
      console.log(chalk.green("i"), "Ok, exiting.");
      process.exit(1);
    }
  }

  process.chdir(root);

  console.log(chalk.green("i"), "Creating boilerplate files.");
  const templateBaseDir = path.join(
    path.dirname(require.resolve("./")),
    "template"
  );
  try {
    fs.copySync(templateBaseDir, root);
    fs.rename(path.join(root, "gitignore"), path.join(root, ".gitignore"));
    const readme = fs.readFileSync(path.join(root, "README.org")).toString();
    fs.writeFileSync(
      path.join(root, "README.org"),
      readme.replace(/<NAMEGOESHERE>/g, appName)
    );
  } catch (e) {
    console.log(chalk.red("ERROR:"), "Could not create files:", e);
    process.exit(1);
  }

  await changeMe(
    path.join(root, "config", "types-config.json"),
    "bugreport email"
  );

  console.log(chalk.green("i"), "Created boilerplate files.");

  const packageJson = {
    name: appName,
    version: "1.0.0",
    description: "Boilerplate for a REST-API",
    main: "index_aws.js",
    scripts: {
      testOne: "jest",
      test: "jest --watch --detectOpenHandles",
      testCoverage: "jest --coverage",
      serve: "node index_local.js",
      generateApiDocs: "node genApiDocs.js > api.html",
    },
  };

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  console.log(chalk.green("i"), "Created package.json.");
  console.log(chalk.green("i"), "Starting to install dependencies.");
  try {
    await installPkgs([
      "@apparts/config",
      "@apparts/db",
      "@apparts/error",
      "@apparts/model",
      "@apparts/model-api",
      "@apparts/types",
      "aws-serverless-express",
      "body-parser",
      "es6-promise",
      "cors",
      "express",
      "morgan",
      "ramda",
      "isomorphic-fetch",
      "pg",
    ]);
    await installPkgs(["@apparts/backend-test", "eslint"], true);
  } catch (e) {
    console.log(
      chalk.red("ERROR:"),
      "Could not install dependencies. See log above for more information."
    );
    process.exit(1);
  }

  console.log(chalk.green("i"), "Installed dependencies.");
  console.log("");
  console.log(chalk.green("i"), "Done.");
  console.log("");
  console.log(
    chalk.green("i"),
    `Next steps:
  - Run # npm run serve
  `
  );
  process.exit(0);
};

const changeMe = async (file, name) => {
  const answer = await askQuestion(`Enter ${name}:`);
  const content = fs.readFileSync(file).toString();
  fs.writeFileSync(file, content.replace(new RegExp(`<${name}>`, "g"), answer));
};

const installPkgs = async (pkgs, asDev = false) => {
  return new Promise((res, rej) => {
    const child = spawn(
      "npm",
      [
        "install",
        asDev ? "--save-dev" : "--save",
        // '--save-exact',
        "--loglevel",
        "error",
        ...pkgs,
      ],
      { stdio: "inherit" }
    );
    child.on("close", (code) => {
      if (code !== 0) {
        rej();
        return;
      }
      res();
    });
  });
};

function isDefaultYes(answer) {
  return answer === "y" || answer === "Y" || answer === "";
}

function isDefaultNo(answer) {
  return answer !== "y" && answer !== "Y";
}

const PAD_TO_COLLUM = 2;
async function askQuestion(question) {
  stdout.write(" ".repeat(PAD_TO_COLLUM) + chalk.yellow("? ") + question + " ");

  const input = await getUserInput();

  return input;
}

async function getUserInput() {
  return new Promise((res) => {
    stdin.addListener("data", (d) => {
      res(d.toString().trim());
    });
  });
}

main();
