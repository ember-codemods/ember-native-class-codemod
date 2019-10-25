const { getOptions } = require('codemod-cli');

module.exports = {
  getCoercedOptions(keys) {
    const options = getOptions();
    Object.keys(options).forEach(key => {
      if (keys.includes(key)) {
        options[key] = options.key == 'true';
      }
    });
    return options;
  },
};
