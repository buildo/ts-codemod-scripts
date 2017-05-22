// jscodeshift -t codmods/exports.js src/exports.js -d -p

/*

  replace

  export default from './AgenciesInputContainer';

  with

  import x from "./AgenciesInputContainer";
  export default x;

  and

  export FlexView from 'react-flexview';

  with

  import FlexView from 'react-flexview';
  export { FlexView }

*/

function isDefault(value) {
  return value.specifiers.length === 1 && value.specifiers[0].exported.name === 'default'
}

function isExportDefault(value) {
  return value.specifiers.some(s => s.type === 'ExportDefaultSpecifier')
}

function getName(from) {
  const as = from.split('/')
  return as[as.length -1].replace(/\.jsx?/, '').replace(/\-/, '')
}

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ExportNamedDeclaration)
    .filter(p => isDefault(p.value) || isExportDefault(p.value))
    .replaceWith(p => {
      if (isDefault(p.value)) {
        const from = p.value.source.value
        const name = getName(from)
        const identifier = j.identifier(name)
        return [
          j.importDeclaration([
            j.importDefaultSpecifier(identifier)
          ], j.stringLiteral(from)),
          j.exportDefaultDeclaration(identifier)
        ]
      } else {
        const from = p.value.source.value
        const identifier = p.value.specifiers.find(s => s.type === 'ExportDefaultSpecifier').exported
        const exports = [
          j.importDeclaration([
            j.importDefaultSpecifier(identifier)
          ], j.stringLiteral(from)),
          j.exportNamedDeclaration(null, [
            j.exportSpecifier(identifier, identifier)
          ])
        ]
        const specifiers = p.value.specifiers.filter(s => s.type !== 'ExportDefaultSpecifier')
        if (specifiers.length > 0) {
          exports.push(j.exportNamedDeclaration(null, specifiers, p.value.source))
        }
        return exports
      }
    })
    .toSource({quote: 'single'})
};
