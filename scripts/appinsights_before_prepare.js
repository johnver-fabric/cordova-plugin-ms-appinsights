/*
 Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved.
 Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.
 */

/*jshint node: true*/

module.exports = function (ctx) {

    var ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;
    var path = ctx.requireCordovaModule('path');
    var shell = ctx.requireCordovaModule('shelljs');

    var projectConfigXml = new ConfigParser(path.join(ctx.opts.projectRoot, 'config.xml'));
    var instrKey = projectConfigXml.getGlobalPreference('instrumentation_key');

    if (instrKey) {
        let pluginConfigFiles = [];
        for (let platform of ctx.opts.platforms) {
            let configFile = path.join(ctx.opts.projectRoot, `platforms`, platform, 'platform_www', 'plugins', ctx.opts.plugin.id, 'www', 'AppInsights.js');
            pluginConfigFiles.push(configFile);
        }

        // replace instrumentation key stub with provided value
        for (let i = 0; i < pluginConfigFiles.length; i++) {
            console.log(`Replacing 'instrumentationKey' parameter in ${pluginConfigFiles[i]} to ${instrKey}`);

            shell.sed('-i',
                /instrumentationKey:\s"(.*?)"/g,
                'instrumentationKey: "' + instrKey + '"',
                pluginConfigFiles[i]);
        }
    } else {
        throw new Error('instrumentation_key parameter is not defined in config.xml');
    }
};
