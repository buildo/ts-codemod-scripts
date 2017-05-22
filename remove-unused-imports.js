// jscodeshift -t codmods/remove-unused-imports.js src/unused-imports.js -d -p

/*

  Rimuove gli import non usati

*/

const imports = {
  'revenge': true
}

export const requiresModule = (path, module) =>
  path
    .findVariableDeclarators()
    .filter(j.filters.VariableDeclarator.requiresModule(module))
    .size() === 1

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportDeclaration)
    .filter(p => imports.hasOwnProperty(p.value.source.value))
    .replaceWith(p => {
      return null
    })
    .toSource({quote: 'single'})
};
