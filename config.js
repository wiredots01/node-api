/*
  * configuration for ENV variables
  * 
  * 
*/

var environments = {};
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging'
};


environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production'
};

var currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';
var environtToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;
module.exports = environtToExport;