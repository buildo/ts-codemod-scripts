// jscodeshift -t codmods/remove-unused-imports.js src/unused-imports-specifiers.js -d -p

/*

  Rimuove gli import specifiers non usati

*/

const specifiers = {
  'pure': true
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
    .filter(imp =>
      imp.value.specifiers && imp.value.specifiers.some(spec => specifiers.hasOwnProperty(spec.local.name))
    )
    .replaceWith(imp => {
      imp.value.specifiers = imp.value.specifiers.filter(spec => !specifiers.hasOwnProperty(spec.local.name))
      return imp.value
    })
    .toSource({quote: 'single'})
};
