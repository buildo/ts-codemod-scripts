// jscodeshift -t codmods/add-static-props.js src/props -d -p

const toStaticType = require('./toStaticType')

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ExportDefaultDeclaration)
    .filter(p => {
      return p.value.declaration.type === 'ClassDeclaration' &&
        p.value.declaration.decorators &&
        p.value.declaration.decorators.length > 0 &&
        p.value.declaration.decorators.some(d => d.expression.callee && d.expression.callee.name === 'props')
    })
    .replaceWith(p => {
      // remove @props decorator
      // const decorators = p.value.declaration.decorators.filter(d => !d.expression.callee || d.expression.callee.name !== 'props')
      // p.value.declaration.decorators = decorators
      const propsDecorator = p.value.declaration.decorators.find(d => d.expression.callee && d.expression.callee.name === 'props')
      p.value.declaration.superTypeParameters = j.typeParameterInstantiation([
        j.genericTypeAnnotation(j.identifier('Props'), null),
        j.voidTypeAnnotation()
      ])
      return [
        j.exportNamedDeclaration(
          j.typeAlias(
            j.identifier('Props'),
            null,
            toStaticType(j, propsDecorator.expression.arguments[0])
          )
        ),
        p.value
      ]
    })
    .toSource({quote: 'single'})
};
