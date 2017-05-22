// jscodeshift -t codmods/lodash-imports.js src/lodash-error.js -d -p

/*

  replace

  import omit from 'lodash/omit';

  with

  import { omit } from 'lodash'

*/
module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportDeclaration)
    .filter(p => p.value.source.value.indexOf('lodash/') !== -1)
    .replaceWith(p => {
      const module = p.value.specifiers[0].local.name
      return [
        j.importDeclaration([
          j.importSpecifier(j.identifier(module))
        ], j.stringLiteral('lodash'))
      ]
    })
    .toSource({quote: 'single'})
};


