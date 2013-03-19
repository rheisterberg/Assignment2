#!/usr/bin/env node

var args = process.argv;
var command = process.argv[2];
var path = require("path");
var config = require("./lib/server/utils/config");
var fs = require("fs");

function usage(command) {
    console.log("\nUsage:\n");
    if (command === "start") {
        console.log("snap start [file_repo_dir] -port port_num\n");
        console.log("file_repo_dir defaults to current directory");
        console.log("optionally specify a port number (default is 8080)");
    } else if (command === "create") {
        console.log("snap create component|page|site name [options]\n");
        console.log("Options for component:\n");
        console.log("----------------------\n");
        console.log(" -params= Optional. comma separated list of input params for component (e.x: -params=name,range,input)\n");
        console.log("Options for page:\n");
        console.log("----------------------\n");
        console.log(" -layout=Required. Layout template to be used for the page (e.x: -layout=onecol.mu)\n");
        console.log(" -position_<position_name>=comma seperated list of components (e.x: -position_header=header)\n");
        console.log("No options for site.\n");
    } else if (command === "test") {
        console.log("snap test [test_directory]\n");
    } else if (command === "test-cov") {
        console.log("snap test [test_directory]\n");
    } else if (command === "validate") {
        console.log("snap validate\n");
    } else if (command === "generate-test") {
        console.log("snap generate-test <folder_containing_artifact_to_test> [options]\n");
        console.log("Options:\n");
        console.log("----------------------\n");
        console.log(" --includeAjax : adds functions to help mock AJAX calls");
        console.log(" --includeAsync : adds functions to help mock clock ticks");
    } else if (command ==="version") {
        console.log("snap version\n");
        console.log("Prints out version.");
    } else {
        console.log("snap help command\n");
        console.log("Available commands: create  start  test  test-cov validate  generate-test version\n");
    }
    console.log("\n");
}

if (command === "start") {

    var file_repo_dir = process.argv[3];
    var optionsIndex = 3;

    if (typeof(file_repo_dir) === "undefined" || file_repo_dir === null || file_repo_dir.indexOf("-") == 0) {
        file_repo_dir = "./";
    } else {
        optionsIndex++;
    }

    var options = []
    for (;optionsIndex < args.length; optionsIndex++) {
        var p = args[optionsIndex];

        if (p.indexOf("=") > 1) {
            var split = p.split("=");
            if (split.length === 2) {
                var value = split[1];
                var key = split[0].replace("-", "");
                options[key] = value;
            }
        } else {
            usage();
            return;
        }
    }
    process.env["FILE_REPO_DIR"] = file_repo_dir;

    var basePath = path.dirname(module.filename);
    process.env["BASE_PATH"] = basePath;
    process.env["BASE_REPO_DIR"] = path.join(basePath, "base");

    var port = config.get(config.SNAP_PORT, 8080);

    if (options["port"]) {
        port = options["port"];
        process.env[config.SNAP_PORT] = port;
    }

    // Double check that we have a valid repo directory!
    try {
        var rt = require ("./lib/server/runtimeObjects");
        var logger = require ("./lib/server/utils/logger");
        logger.setConsoleLogging(null);
        logger.setConsoleLogging("error");

        var fetcher = require("./lib/server/fetchers/config");

        // FIXME: Curently hard coding to file fetcher for dev mode.
        var configObj = {
            fetcher: {
                moduleName: "file",
                repositoryDirectory: process.env["FILE_REPO_DIR"],
                baseDirectory: process.env["BASE_REPO_DIR"]
            }
        };
        var ctx = new rt.CallContext();
        fetcher.configure(ctx, configObj);

        fetcher.getFetcher().getSiteMetaData(function(err) {
            if (err) {
                console.log("Error finding site configuration: " + file_repo_dir + " may not be a valid repo directory.")
                process.exit(1);
            }
        });
    } catch (e) {
        console.log(e.stack);
        console.log("Error finding site configuration: " + file_repo_dir + " may not be a valid repo directory.")
        process.exit(1);
    }

    console.log("Started Snap! on port " + port);
    var snap = require("./app.js");
} else if (command === "test") {
    var basePath = path.dirname(module.filename);
    process.env["BASE_PATH"] = basePath;
    process.env["BASE_REPO_DIR"] = path.join(basePath, "base");
    try{
        require(path.join(basePath,"./lib/testing/lib/extensionTester")).test(process.argv[3], command);
    }catch(e){
        console.log(e.stack);
    }

    var absolutePath;

    if (args.length > 3) {
        absolutePath = path.resolve(args[3]);
    } else {
        absolutePath = path.resolve('.');
    }

    var testingUtils = require(basePath + "/lib/testing").testingUtils;
    var covDir = testingUtils.createCoverageDirectory(absolutePath, "repo-cov");
    testingUtils.runCovAndUnitTests(absolutePath, covDir, basePath);
} else if(command === "test-cov" || command === "test-cov-html"){
    var basePath = path.dirname(module.filename);
    process.env["BASE_PATH"] = basePath;
    process.env["BASE_REPO_DIR"] = path.join(basePath, "base");

    var testingUtils = require(basePath + "/lib/testing").testingUtils;

    try{
        require(path.join(basePath,"./lib/testing/lib/extensionTester")).test(process.argv[3], command, function() {

            //client stuff
            var absolutePath;
            if (args.length > 3) {
                absolutePath = path.resolve(args[3]);
            } else {
                absolutePath = path.resolve('.');
            }

            if (command === "test-cov") {
                var covDir = testingUtils.createCoverageDirectory(absolutePath, "repo-cov");
                testingUtils.runCov(absolutePath, covDir, basePath, true);
            }
        });
    }catch(e){
        console.log(e.stack);
    }
} else if(command === "validate"){
    var basePath = path.dirname(module.filename);
    process.env["BASE_PATH"] = basePath;
    process.env["BASE_REPO_DIR"] = path.join(basePath, "base");
    process.env["FILE_REPO_DIR"] = "./";
    try{
        require(path.join(basePath,'lib/validator/main.js'));
    }catch(e){
        console.log(e.stack);
    }
} else if (command === "create") {
    var templatePath = path.join(path.dirname(module.filename), "templates");;
    var file_repo_dir = "./";
    var artifact = args[3];
    var name = args[4];
    if (!name || name.indexOf("-") === 0) {
        console.log("Missing artifact type or name\n");
        usage(command);
        process.exit(1);
    }
    var params = {};
    for (var i=5; i < args.length; i++) {
        var p = args[i];
        if (p.indexOf("=") > 1) {
            var split = p.split("=");
            if (split.length === 2) {
                var values = split[1].split(",");
                var key = split[0].replace("-", "");
                //console.log(key);
                if (key.indexOf("position_") !== -1) {
                    if (!params.positions) {
                        params.positions = {}
                    }
                    params.positions[key.replace("position_", "")] = values;
                } else if ( (key === "params" && artifact === "component")
                    || (key === "layout" && artifact === "page" ) ) {
                    params[key] = values;
                } else {
                    console.log("Invalid option " + p + "\n");
                    //usage("create");
                    process.exit(1);

                }
                continue;
            }
        } else {
            console.log("Invalid option: " + p + "\n");
            //usage("create");
            process.exit(1);
        }
    }
    if (artifact === "component") {
        var input = [];
        if (params.params) {

            params.params.forEach(function (val, index, array) {
                input.push ({
                    "name" : val,
                    "type" : "string",
                    "required" : "true"
                });
            });

        }

        var componentPath = file_repo_dir + "component/" + name;
        try {
            if (!fs.existsSync(file_repo_dir + "component")) {
                fs.mkdirSync(file_repo_dir + "component");
            }

            fs.mkdirSync(componentPath);
        } catch(err) {
            console.log("\nUnable to add component '" + name + "' to repo. Check if it already exists.\n");
            return;
        }
        fs.mkdirSync(componentPath + "/views");
        fs.mkdirSync(componentPath + "/js");
        fs.mkdirSync(componentPath + "/css");
        fs.mkdirSync(componentPath + "/assets");

        var data = fs.readFileSync(templatePath + "/component/component.json");
        var componentJSON = JSON.parse(data);
        componentJSON.name = name;
        componentJSON.input_parameters = input;
        fs.writeFileSync(componentPath + "/component.json", JSON.stringify(componentJSON, null, 2));

        var js = fs.readFileSync(templatePath + "/component/js/controller.js");
        fs.writeFileSync(componentPath + "/js/controller.js", js);

        var indexView = fs.readFileSync(templatePath + "/component/views/index.mu");
        fs.writeFileSync(componentPath + "/views/index.mu", indexView);

        var assetYml = fs.readFileSync(templatePath + "/component/assets/assets.yml");
        fs.writeFileSync(componentPath + "/assets/assets.yml", assetYml);

        console.log("Successfully created component : " + name );

    } else if (artifact === "page") {
        if (!params.layout) {
            console.log("\nMissing layout argument. \n");
            usage(command);
            return;
        }

        var positions = {};
        if (params.positions) {
            for(var positionName in params.positions) {
                var components = [];
                params.positions[positionName].forEach(function (val) {
                    components.push({
                        "component": val
                    });
                });

                positions[positionName] = components;
            }
        }

        var pagePath = file_repo_dir + "page/" + name;
        try {
            if (!fs.existsSync(file_repo_dir + "page")) {
                fs.mkdirSync(file_repo_dir + "page");
            }

            fs.mkdirSync(pagePath);
        } catch(err) {
            console.log("\nUnable to add page '" + name + "' to repo. Check if it already exists.\n");
            return;
        }

        var data = fs.readFileSync(templatePath + "/page/page.json");
        var pageJSON = JSON.parse(data);
        pageJSON.name = name;
        pageJSON.layout = params.layout[0];
        pageJSON.positions = positions;
        fs.writeFileSync(pagePath + "/page.json", JSON.stringify(pageJSON, null, 2));

        console.log("Successfully created page : " + name );

    } else if (artifact === "site") {
        var sitePath = file_repo_dir + "site/" + name;
        try {
            if (!fs.existsSync(file_repo_dir + "site")) {
                fs.mkdirSync(file_repo_dir + "site");
            }

            fs.mkdirSync(sitePath);
        } catch(err) {
            console.log("\nUnable to add site '" + name + "' to repo. Check if it already exists.\n");
            return;
        }

        var data = fs.readFileSync(templatePath + "/site/meta.json");
        var metaJSON = JSON.parse(data);
        metaJSON.sites.localhost = name;
        metaJSON[name] = {
            locale: "en_US"
        }
        fs.writeFileSync("site/meta.json", JSON.stringify(metaJSON, null, 2));

        data = fs.readFileSync(templatePath + "/site/site/urimapper.json");
        fs.writeFileSync(sitePath + "/urimapper.json", data);

        console.log("Successfully created site : " + name );
    } else {
        console.log("Invalid artifact type\n");
    }
} else if (command === "help" && args.length > 3) {
    usage(args[3]);
} else if (command === "generate-test") {
    if (args.length >= 4) {
        var basePath = path.dirname(module.filename);
        try {
            fs.mkdirSync(args[3] + "/test");
        } catch (err) {
            //do nothing - the directory already exists
        }

        var absolutePath = path.resolve(args[3]);
        var artifactName = absolutePath.split('/').pop();

        if (absolutePath.indexOf("/component/") !== -1) {
            var compUtils = require(basePath + "/lib/testing").componentUtils;

            var ajaxFunctions = "";
            if (args.indexOf("--includeAjax") != -1) {
                //build out the AJAX mocking functions if necessary
                ajaxFunctions = compUtils.getStubbedAjaxCalls();
            }

            var asyncFunctions = "";
            if (args.indexOf("--includeAsync") != -1) {
                //build out the async mocking functions if necessary
                asyncFunctions = compUtils.getStubbedAsyncCalls();
            }

            var componentContext = JSON.stringify(compUtils.generateComponentContext(args[3]));

            var renderingContext = {
                artifactName: artifactName,
                servingDir: basePath,
                componentContext: componentContext,
                ajaxFunctions: ajaxFunctions,
                asyncFunctions: asyncFunctions
            };

            compUtils.generateClientTestSkeletonFile(args[3], componentContext, renderingContext);
            compUtils.generateExtensionTestSkeletonFile(args[3], artifactName);
        } else if (absolutePath.indexOf("/widget/") !== -1) {
            var renderingContext = {
                artifactName: artifactName,
                servingDir: basePath
            };

            try {
                // Read in templates
                var file = basePath + '/lib/client/testing/widget-test-skeleton.jade';
                var str = fs.readFileSync(file, 'utf8');
                var fn = jade.compile(str, {filename: file, pretty: true});

                fs.writeFile(args[3] + "/test/" + artifactName + "Test.html", fn(renderingContext), function (err) {
                    if (err) {
                        console.error("error: " + err);
                        process.exit(1);
                    }
                });
            }
            catch(err) {
                console.error("error: " + err);
                process.exit(1);

            }
        }
    } else {
        usage(command);
    }
} else if (command === "version") {
    var basePath = path.dirname(module.filename);
    console.log(fs.readFileSync(basePath + "/versioninfo", "utf8"));
} else {
    usage();
}
