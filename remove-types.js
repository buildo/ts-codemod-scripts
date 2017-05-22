// jscodeshift -t codmods/remove-types.js src/types.js -d -p

module.exports = function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.TypeAnnotation)
    .replaceWith(p => null)
    .toSource()
};



