"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "layout",

    docs: {
      description: "Enforce placing object properties on separate lines",
      recommended: false,
    },

    schema: [
      {
        type: "object",
        properties: {
          minProperties: {
            type: "number",
            default: Infinity
          },
          minLineLength: {
            type: "number",
            default: Infinity
          }
        },
        additionalProperties: false
      }
    ],

    fixable: "whitespace",

    messages: {
      propertiesOnNewline: "Object properties must go on a new line."
    }
  },

  create(context) {
    const minProperties = context.options[0]?.minProperties ?? Infinity;
    const minLength = context.options[0]?.minLineLength ?? Infinity;

    const messageId = "propertiesOnNewline";

    const sourceCode = context.getSourceCode();

    return {
      [[
        "ObjectExpression",
        "ObjectPattern"
      ]](node) {
        if (node.properties.length < 1) {
          return;
        }

        const firstTokenOfFirstProperty = sourceCode.getFirstToken(node.properties[0]);
        const lastTokenOfLastProperty = sourceCode.getLastToken(node.properties[node.properties.length - 1]);

        if (firstTokenOfFirstProperty.loc.end.line === lastTokenOfLastProperty.loc.start.line) {
          if (node.properties.length <= minProperties && node.end - node.start <= minLength) {
            return;
          }
        }

        for (let i = 1; i < node.properties.length; i++) {
          const lastTokenOfPreviousProperty = sourceCode.getLastToken(node.properties[i - 1]);
          const firstTokenOfCurrentProperty = sourceCode.getFirstToken(node.properties[i]);

          if (lastTokenOfPreviousProperty.loc.end.line === firstTokenOfCurrentProperty.loc.start.line) {
            context.report({
              node,
              loc: firstTokenOfCurrentProperty.loc,
              messageId,
              fix(fixer) {
                const comma = sourceCode.getTokenBefore(firstTokenOfCurrentProperty);
                const rangeAfterComma = [comma.range[1], firstTokenOfCurrentProperty.range[0]];

                // Don't perform a fix if there are any comments between the comma and the next property.
                if (sourceCode.text.slice(rangeAfterComma[0], rangeAfterComma[1]).trim()) {
                  return null;
                }

                return fixer.replaceTextRange(rangeAfterComma, "\n");
              }
            });
          }
        }
      }
    };
  }
};
