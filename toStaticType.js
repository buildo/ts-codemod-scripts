function isCombinator(combinator, ast) {
  if (ast.type !== 'CallExpression') {
    return false
  }
  if (ast.callee.type === 'Identifier') {
    return ast.callee.name === combinator
  }
  if (combinator === 'enums') {
    return ast.callee.property.name === 'of' && ast.callee.object.property.name === 'enums' && ast.callee.object.object.name === 't'
  }
  return ast.callee.object.name === 't' && ast.callee.property.name === combinator
}

function isMaybe(ast) {
  return isCombinator('maybe', ast)
}

function isUnion(ast) {
  return isCombinator('union', ast)
}

function isList(ast) {
  return isCombinator('list', ast)
}

function isRefinement(ast) {
  return isCombinator('refinement', ast) || isCombinator('subtype', ast)
}

function isStruct(ast) {
  return isCombinator('struct', ast)
}

function isInterface(ast) {
  return isCombinator('interface', ast)
}

function toObjectTypeProperty(j, p) {
  if (p.type === 'SpreadProperty') {
    return j.objectTypeProperty(j.identifier(message), j.genericTypeAnnotation(j.identifier(message), null), false)
  }
  const optional = isMaybe(p.value)
  if (optional) {
    return j.objectTypeProperty(p.key, toStaticType(j, p.value.arguments[0]), true)
  }
  return j.objectTypeProperty(p.key, toStaticType(j, p.value), false)
}

function toUnion(j, args) {
  return j.unionTypeAnnotation(args.elements.map(a => toStaticType(j, a)))
}

function toArray(j, ast) {
  return j.genericTypeAnnotation(j.identifier('Array'), j.typeParameterInstantiation([toStaticType(j, ast)]))
}

function isEnums(ast) {
  return isCombinator('enums', ast)
}

function toEnums(j, ast) {
  if (!ast.elements) {
    return j.genericTypeAnnotation(j.identifier(message), null)
  }
  return j.unionTypeAnnotation(ast.elements.map(a => j.stringLiteralTypeAnnotation(a.value, a.value)))
}

const message = 'TODOPROPS'

function toStaticType(j, ast) {
  switch (ast.type) {
    case 'ObjectExpression' :
      return j.objectTypeAnnotation(
        ast.properties.map(p => toObjectTypeProperty(j, p)),
        []
      )
    case 'CallExpression' :
      if (isUnion(ast)) {
        return toUnion(j, ast.arguments[0])
      }
      if (isList(ast)) {
        return toArray(j, ast.arguments[0])
      }
      if (isEnums(ast)) {
        return toEnums(j, ast.arguments[0])
      }
      if (isRefinement(ast)) {
        return toStaticType(j, ast.arguments[0])
      }
      if (isStruct(ast) || isInterface(ast)) {
        return toStaticType(j, ast.arguments[0])
      }
      return j.genericTypeAnnotation(j.identifier(message), null)
    case 'MemberExpression' :
      return toStaticType(j, ast.property)
    case 'Identifier' :
      switch (ast.name) {
        case 'Boolean' :
          return j.booleanTypeAnnotation()
        case 'String' :
          return j.stringTypeAnnotation()
        case 'Number' :
        case 'Integer' :
          return j.numberTypeAnnotation()
        case 'Any' :
          return j.anyTypeAnnotation()
        default :
          return j.genericTypeAnnotation(ast, null)
      }
    default :
      return j.genericTypeAnnotation(j.identifier(message), null)
  }
}

module.exports = toStaticType
