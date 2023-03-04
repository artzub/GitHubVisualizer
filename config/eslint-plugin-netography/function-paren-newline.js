//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

function isOpeningParenToken(token) {
  return token.value === "(" && token.type === "Punctuator";
}

function isClosingParenToken(token) {
  return token.value === ")" && token.type === "Punctuator";
}

function isTokenOnSameLine(left, right) {
  return left.loc.end.line === right.loc.start.line;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint/lib/shared/types').Rule} */
module.exports = {
  meta: {
    type: "layout",

    docs: {
      description: "Enforce consistent line breaks inside function parentheses by function name",
      recommended: false,
    },

    fixable: "whitespace",

    schema: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          pattern: {
            type: "string"
          },
          minArgs: {
            type: "number",
            default: 0,
          },
        },
        additionalProperties: false,
      }
    },

    messages: {
      expectedBefore: "Expected newline before ')'.",
      expectedAfter: "Expected newline after '('.",
      expectedBetween: "Expected newline between arguments/params.",
      unexpectedBefore: "Unexpected newline before ')'.",
      unexpectedAfter: "Unexpected newline after '('."
    }
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const patterns = (context.options || []).map((s) => ({
      pattern: new RegExp(s.pattern),
      minArgs: s.minArgs || 0,
    }));
    const minItems = 1;

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Determines whether there should be newlines inside function parens
     * @param {ASTNode[]} elements The arguments or parameters in the list
     * @returns {boolean} `true` if there should be newlines inside the function parens
     */
    function shouldHaveNewlines(elements) {
      return elements.length >= minItems;
    }

    /**
     * Validates parens
     * @param {Object} parens An object with keys `leftParen` for the left paren token, and `rightParen` for the right paren token
     * @param {ASTNode[]} elements The arguments or parameters in the list
     * @returns {void}
     */
    function validateParens(parens, elements) {
      const leftParen = parens.leftParen;
      const rightParen = parens.rightParen;
      const tokenAfterLeftParen = sourceCode.getTokenAfter(leftParen);
      const tokenBeforeRightParen = sourceCode.getTokenBefore(rightParen);
      const hasLeftNewline = !isTokenOnSameLine(leftParen, tokenAfterLeftParen);
      const hasRightNewline = !isTokenOnSameLine(tokenBeforeRightParen, rightParen);
      const needsNewlines = shouldHaveNewlines(elements);

      if (hasLeftNewline && !needsNewlines) {
        context.report({
          node: leftParen,
          messageId: "unexpectedAfter",
          fix(fixer) {
            return sourceCode.getText().slice(leftParen.range[1], tokenAfterLeftParen.range[0]).trim()

              // If there is a comment between the ( and the first element, don't do a fix.
              ? null
              : fixer.removeRange([leftParen.range[1], tokenAfterLeftParen.range[0]]);
          }
        });
      } else if (!hasLeftNewline && needsNewlines) {
        context.report({
          node: leftParen,
          messageId: "expectedAfter",
          fix: fixer => fixer.insertTextAfter(leftParen, "\n")
        });
      }

      if (hasRightNewline && !needsNewlines) {
        context.report({
          node: rightParen,
          messageId: "unexpectedBefore",
          fix(fixer) {
            return sourceCode.getText().slice(tokenBeforeRightParen.range[1], rightParen.range[0]).trim()

              // If there is a comment between the last element and the ), don't do a fix.
              ? null
              : fixer.removeRange([tokenBeforeRightParen.range[1], rightParen.range[0]]);
          }
        });
      } else if (!hasRightNewline && needsNewlines) {
        context.report({
          node: rightParen,
          messageId: "expectedBefore",
          fix: fixer => fixer.insertTextBefore(rightParen, "\n")
        });
      }
    }

    /**
     * Validates a list of arguments or parameters
     * @param {Object} parens An object with keys `leftParen` for the left paren token, and `rightParen` for the right paren token
     * @param {ASTNode[]} elements The arguments or parameters in the list
     * @returns {void}
     */
    function validateArguments(parens, elements) {
      const leftParen = parens.leftParen;
      const tokenAfterLeftParen = sourceCode.getTokenAfter(leftParen);
      const hasLeftNewline = !isTokenOnSameLine(leftParen, tokenAfterLeftParen);
      const needsNewlines = shouldHaveNewlines(elements, hasLeftNewline);

      for (let i = 0; i <= elements.length - 2; i++) {
        const currentElement = elements[i];
        const nextElement = elements[i + 1];
        const hasNewLine = currentElement.loc.end.line !== nextElement.loc.start.line;

        if (!hasNewLine && needsNewlines) {
          context.report({
            node: currentElement,
            messageId: "expectedBetween",
            fix: fixer => fixer.insertTextBefore(nextElement, "\n")
          });
        }
      }
    }

    /**
     * Gets the left paren and right paren tokens of a node.
     * @param {ASTNode} node The node with parens
     * @throws {TypeError} Unexpected node type.
     * @returns {Object} An object with keys `leftParen` for the left paren token, and `rightParen` for the right paren token.
     * Can also return `null` if an expression has no parens (e.g. a NewExpression with no arguments, or an ArrowFunctionExpression
     * with a single parameter)
     */
    function getParenTokens(node) {
      switch (node.type) {
        case "NewExpression":
          if (!node.arguments.length &&
            !(
              isOpeningParenToken(sourceCode.getLastToken(node, { skip: 1 })) &&
              isClosingParenToken(sourceCode.getLastToken(node)) &&
              node.callee.range[1] < node.range[1]
            )
          ) {

            // If the NewExpression does not have parens (e.g. `new Foo`), return null.
            return null;
          }

        // falls through

        case "CallExpression":
          return {
            leftParen: sourceCode.getTokenAfter(node.callee, isOpeningParenToken),
            rightParen: sourceCode.getLastToken(node)
          };

        default:
          throw new TypeError(`unexpected node with type ${node.type}`);
      }
    }

    function isAllowed(name, length) {
      return patterns.some(({ pattern, minArgs }) => (
        length > minArgs && pattern.test(name)
      ));
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    if (patterns.length < 1) {
      return {};
    }

    return {
      [[
        "CallExpression",
        "NewExpression"
      ]](node) {
        const name = node.callee.name || node.callee.property?.name;
        const params = node.arguments;

        if (!(name && isAllowed(name, params.length))) {
          return;
        }

        const parens = getParenTokens(node);

        if (parens) {
          validateParens(parens, params);
          validateArguments(parens, params);
        }
      }
    };
  }
};
