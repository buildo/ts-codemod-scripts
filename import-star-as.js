// jscodeshift -t codmods/import-star-as.js src/tcomb.js -d -p

/*

  replace

  import t from "tcomb";

  with

  import * as t from "tcomb";

*/

const imports = {
  'tcomb': true,
  'cookies-js': true,
  'react': true,
  'react-dom': true,
  'assert': true,
  'react-router': true,
  'classnames': true
}

function createImportStarAs(j, as, from) {
  return j.importDeclaration([
    j.importNamespaceSpecifier(j.identifier(as))
  ], j.stringLiteral(from))
}

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportDeclaration)
    .filter(p => imports.hasOwnProperty(p.value.source.value))
    .replaceWith(p => {
      const from = p.value.source.value
      const out = []
      const defaultSpecifier = p.value.specifiers.find(s => s.type === 'ImportDefaultSpecifier')
      if (defaultSpecifier) {
        const as = defaultSpecifier.local.name
        const importStar = createImportStarAs(j, as, from)
        importStar.comments = p.value.comments
        out.push(importStar)
      }
      const otherSpecifiers = p.value.specifiers.filter(s => s.type !== 'ImportDefaultSpecifier')
      if (otherSpecifiers.length > 0) {
        out.push(j.importDeclaration(otherSpecifiers.map(s => j.importSpecifier(s.imported, s.local)), j.stringLiteral(from)))
      }
      return out
    })
    .toSource({quote: 'single'})
};
