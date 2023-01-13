'use strict';

module.exports = {
  singleQuote: true,
  printWidth: 100,
  overrides: [
    {
      files: '*.ts',
      options: {
        printWidth: 80,
      },
    },
  ],
};
