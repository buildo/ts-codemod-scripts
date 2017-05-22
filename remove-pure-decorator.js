// jscodeshift -t codmods/remove-pure-decorator.js src -d -p

/*

  Rimuove il decoratore @pure e sostituisce React.Component con React.PureComponent

*/

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ClassDeclaration)
    .filter(p => {
      return p.value.decorators && p.value.decorators.length > 0 && p.value.decorators.some(d => d.expression.name === 'pure')
    })
    .replaceWith(p => {
      const decorators = p.value.decorators.filter(d => d.expression.name !== 'pure')
      p.value.decorators = decorators
      p.value.superClass.property.name = 'PureComponent'
      return p.value
    })
    .toSource({quote: 'single'})
};
