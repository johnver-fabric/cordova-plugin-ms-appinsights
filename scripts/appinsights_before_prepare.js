/*
 Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved.
 Licensed under the Apache License, Version 2.0.  See License.txt in the project root for license information.
 */

/*jshint node: true*/

module.exports = function (ctx) {
  const ConfigParser = ctx.requireCordovaModule('cordova-common').ConfigParser;

  const path = ctx.requireCordovaModule('path');
  const shell = ctx.requireCordovaModule('shelljs');
  const config = ctx.requireCordovaModule(path.resolve(ctx.opts.projectRoot, 'www', 'extensions.js'));

  const projectConfigXml = new ConfigParser(path.join(ctx.opts.projectRoot, 'config.xml'));
  const pluginElement = projectConfigXml.getPlugin(ctx.opts.plugin.id);

  console.log(`
    **********************************
    * Running AppInsight Hook!
    * Environment: ${config.servetype}
    **********************************
  `);

  //change this key to app's AppInsights key
  const instrumentation_key = pluginElement.variables[config.servetype.toUpperCase()];

  let pluginConfigFile = path.resolve(ctx.opts.plugin.dir, 'www', 'AppInsights.js');
  if (instrumentation_key) {
    let pluginConfigFiles = [];
    pluginConfigFiles.push(pluginConfigFile);
    for (let platform of ctx.opts.platforms) {
      let configFile = path.join(ctx.opts.projectRoot, `platforms`, platform, 'platform_www', 'plugins', ctx.opts.plugin.id, 'www', 'AppInsights.js');
      pluginConfigFiles.push(configFile);
    }

    // replace instrumentation key stub with provided value
    for (let i = 0; i < pluginConfigFiles.length; i++) {
      console.log(`Replacing 'instrumentationKey' parameter in ${pluginConfigFiles[i]} to ${instrumentation_key}`);

      shell.sed('-i',
        /instrumentationKey:\s"(.*?)"/g,
        'instrumentationKey: "' + instrumentation_key + '"',
        pluginConfigFiles[i]);
    }
  } else {
    throw new Error('instrumentation_key parameter is not defined');
  }
};