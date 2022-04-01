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
const prettier = require("prettier");
const crypto = require("crypto");

const argv = yargs(hideBin(process.argv))
  .command("$0", "", (yargs) =>
    yargs
      .positional("project-name", {
        description: "The project name.",
        type: "string",
      })
      .usage("$0 <project-name>")
  )
  .option("no-db", {
    type: "boolean",
    description: "Don't install @apparts/db and pg",
  })
  .option("no-model", {
    type: "boolean",
    description: "Don't install @apparts/model",
  })
  .option("no-model-api", {
    type: "boolean",
    description: "Don't install @apparts/model-api",
  })
  .option("login-server", {
    type: "boolean",
    description: "Install @apparts/login-server",
  })
  .help()
  .alias("help", "h").argv;

const {
  _: [name],
  db: withDb = true,
  model: withModel = true,
  "model-api": withModelApi = true,
  "login-server": withLoginServer,
} = argv;

const useLoginServer = withLoginServer;
const useModel = (withModel && withDb) || withLoginServer;
const useModelApi = withModelApi && useModel;
const useDb = withDb || useModel;

const main = async () => {
  const root = path.resolve(name);
  let appName = path.basename(root);

  const answer = await askQuestion(`Enter project name [${appName}]:`);
  if (answer !== "") {
    appName = answer;
  }

  console.log(
    chalk.green("i"),
    `Creating REST API ${chalk.green(appName)} in ${chalk.green(root)},`
  );
  console.log(" ", `with these features:`);
  const yesNo = (yes) => "[" + (yes ? chalk.green("✓") : " ") + "]";
  const yesParam = (yes, paramYes) =>
    "(" + (yes ? chalk.bold(`${paramYes}`) : `${paramYes}`) + ")";
  const noParam = (yes, paramNo) =>
    "(" + (!yes ? chalk.bold(`${paramNo}`) : `${paramNo}`) + ")";
  console.log(`    ${yesNo(true)} @apparts/types (required)
    ${yesNo(useDb)} @apparts/db ${noParam(withDb, "--no-db")}
    ${yesNo(useModel)} @apparts/model ${noParam(withModel, "--no-model")}
    ${yesNo(useModelApi)} @apparts/model-api ${noParam(
    withModelApi,
    "--no-model-api"
  )}
    ${yesNo(useLoginServer)} @apparts/login-server ${yesParam(
    withLoginServer,
    "--login-server"
  )}`);

  if (!isDefaultYes(await askQuestion(`Is this ok? [Y/n]`))) {
    process.exit(1);
  }

  fs.ensureDirSync(name);

  const content = fs.readdirSync(root);
  if (content.length > 0) {
    console.log(
      `${chalk.yellow("WARNING:")} The directory ${chalk.green(
        root
      )} is not empty.`
    );
    const answer = await askQuestion("Do you want to continue? [y/N]", 2);
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
  const nextSteps = [];
  try {
    fs.copySync(templateBaseDir, root);

    fs.rename(path.join(root, "gitignore"), path.join(root, ".gitignore"));

    const readme = fs.readFileSync(path.join(root, "README.org")).toString();
    fs.writeFileSync(
      path.join(root, "README.org"),
      readme.replace(/<NAMEGOESHERE>/g, appName)
    );

    if (useDb) {
      await mergeFiles(root, templateBaseDir, "db");
    }
    if (useModel) {
      await mergeFiles(root, templateBaseDir, "model");
    }
    if (useModelApi) {
      await mergeFiles(root, templateBaseDir, "model-api");
    }
    if (useLoginServer) {
      await mergeFiles(root, templateBaseDir, "login-server");
      await replaceInFileAskUser(
        path.join(root, "config", "mail-config.json"),
        "login server sender email address"
      );
      nextSteps.push("  - Check content of config/aws-config.json");
      nextSteps.push("  - Check content of config/login-config.js");
    }
    if (useLoginServer || useModelApi) {
      await replaceInFile(
        path.join(root, "config", "login-token-config.js"),
        "login token config webtokenkey",
        await genToken(128)
      );
    }
    await cleanFiles(root);
  } catch (e) {
    console.log(chalk.red("ERROR:"), "Could not create files:", e);
    process.exit(1);
  }

  await replaceInFileAskUser(
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
      "test:one": "jest",
      test: "jest --watch --detectOpenHandles",
      "test:coverage": "jest --coverage",
      start: "node index_local.js",
      "generate:docs": "node genApiDocs.js > api.html",
      clean: "rimraf coverage build",
      ci: "npm ci && npm run ci:prettier && npm run ci:eslint && npm run ci:test && npm run build",
      "ci:prettier": "CI=true prettier --check .",
      "ci:test": "CI=true npm run test:one",
      "ci:eslint": "eslint . --ext .js,.ts -c .eslintrc.ci.js",
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
      ...(useDb ? ["@apparts/db", "pg"] : []),
      "@apparts/error",
      ...(useModel ? ["@apparts/model"] : []),
      ...(useModelApi ? ["@apparts/model-api"] : []),
      ...(useLoginServer ? ["@apparts/login-server", "aws-sdk"] : []),
      "@apparts/types",
      "aws-serverless-express",
      "body-parser",
      "es6-promise",
      "cors",
      "express",
      "morgan",
      "ramda",
      "isomorphic-fetch",
    ]);
    console.log();
    console.log(chalk.green("i"), "Starting to install dev-dependencies.");
    await installPkgs(
      ["@apparts/backend-test", "eslint", "prettier", "rimraf"],
      true
    );
  } catch (e) {
    console.log(
      chalk.red("ERROR:"),
      "Could not install dependencies. See log above for more information."
    );
    process.exit(1);
  }

  console.log("");
  console.log(chalk.green("i"), "Installed dependencies.");
  console.log(chalk.green("i"), "Done.");
  console.log(
    chalk.green("i"),
    `Next steps:
${nextSteps.join("\n")}
  - Run # npm run start
`
  );
  process.exit(0);
};

const replaceInFile = async (file, name, value) => {
  const content = fs.readFileSync(file).toString();
  fs.writeFileSync(file, content.replace(new RegExp(`<${name}>`, "g"), value));
};

const replaceInFileAskUser = async (file, name) => {
  const answer = await askQuestion(`Enter ${name}:`);
  replaceInFile(file, name, answer);
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

async function askQuestion(question, PAD_TO_COLLUM = 0) {
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

const cleanFiles = async (root) => {
  const files = await walkDirectory(root);
  for (const file of files) {
    let newTargetContent = fs
      .readFileSync(file)
      .toString()
      .replace(/(\/\* ###<[^*]+>### \*\/)/g, "");
    if (/\.jsx?$|\.ts$|\.css$/.test(file)) {
      try {
        newTargetContent = prettier.format(newTargetContent, {
          parser: "babel",
        });
      } catch (e) {
        console.log(chalk.red("ERROR:"), "Could not prettify in file " + file);
        throw e;
      }
    }
    fs.writeFileSync(file, newTargetContent);
  }
};

const mergeFiles = async (root, templateBaseDir, templateName) => {
  const templateWithF = path.join(templateBaseDir, "..", "with", templateName);
  const files = await walkDirectory(templateWithF);

  for (const file of files) {
    const target = path.join(root, path.relative(templateWithF, file));
    if (fs.existsSync(target)) {
      // merge
      let targetContent = fs.readFileSync(target).toString();
      const mergeIn = fs
        .readFileSync(file)
        .toString()
        .split(/(\/\* ###<.+>### \*\/)/);

      for (let i = 1; i < mergeIn.length; i += 2) {
        targetContent = targetContent.replace(mergeIn[i], mergeIn[i + 1]);
      }
      fs.writeFileSync(target, targetContent);
    } else {
      fs.copySync(file, target);
    }
  }
};

const walkDirectory = async (currentDir) => {
  const content = (await fs.readdir(currentDir)).map((name) =>
    path.join(currentDir, name)
  );
  const stats = await Promise.all(content.map((file) => fs.stat(file)));
  const files = content.filter((_, i) => stats[i].isFile());
  const directories = content.filter((_, i) => !stats[i].isFile());
  const subFiles = await Promise.all(
    directories.map((dir) => walkDirectory(dir))
  );
  return files.concat(...subFiles);
};

const genToken = async (tokenLength) => {
  return new Promise((res) => {
    crypto.randomBytes(tokenLength, (err, token) => {
      if (err) {
        throw "Could not generate Token" + err;
      } else {
        res(token.toString("base64"));
      }
    });
  });
};

main();
