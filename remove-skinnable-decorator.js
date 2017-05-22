// jscodeshift -t codmods/remove-skinnable-decorator.js src/skinnable -d -p

/*

  Rimuove il decoratore @skinnable e aggiunge il metodo render appropriato

*/

module.exports = function (file, api) {
  const j = api.jscodeshift;
  const predicate = d => d.expression.callee && d.expression.callee.name === 'skinnable'

  return j(file.source)
    .find(j.ClassDeclaration)
    .filter(p => p.value.decorators && p.value.decorators.some(predicate))
    .replaceWith(p => {
      const skinnableDecorator = p.value.decorators.find(predicate)
      // rimuovo il decorator
      p.value.decorators = p.value.decorators.filter(d => !d.expression.callee || d.expression.callee.name !== 'skinnable')
      const body = p.value.body.body
      // aggiungo il metodo render
      body.push(j.classMethod(
        'method',
        j.identifier('render'),
        [],
        j.blockStatement(getRenderBody(j, skinnableDecorator))
      ))
      return p.value
    })
    .toSource({quote: 'single', commas: false})
};

function getLocalsCall(j) {
  return j.callExpression(
    j.memberExpression(
      j.thisExpression(),
      j.identifier('getLocals')
    ),
    [
      j.memberExpression(
        j.thisExpression(),
        j.identifier('props')
      )
    ]
  )
}

function getSimpleRenderBody(j) {
  return [
    j.returnStatement(j.callExpression(
      j.memberExpression(
        j.thisExpression(),
        j.identifier('template')
      ),
      [getLocalsCall(j)]
    ))
  ]
}

function getJSXrenderBody(j, name) {
  return [
    j.returnStatement(j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(name),
        [
          j.jsxSpreadAttribute(getLocalsCall(j))
        ],
        true
      )
    ))
  ]
}

function getRenderBody(j, skinnableDecorator) {
  if (skinnableDecorator.expression.arguments.length === 0) {
    return getSimpleRenderBody(j)
  }
  const arg = skinnableDecorator.expression.arguments[0]
  if (arg.type === 'Identifier') {
    return getJSXrenderBody(j, arg.name)
  }
  if (arg.type === 'CallExpression') {
    const componentName = 'C'
    return [
      j.variableDeclaration('const', [
        j.variableDeclarator(j.identifier(componentName), arg)
      ])
    ].concat(getJSXrenderBody(j, componentName))
  }
  return getJSXrenderBody(j, arg.arguments[0].name)
}
