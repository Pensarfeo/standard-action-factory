module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jest": true
    },
    "extends": [
        "airbnb",
    ],
    "plugins": ["jest"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true,
            "classes": true
        },
        "sourceType": "module"
    },
    "settings": {
        "import/resolver": {
            "node": {
                "extensions": [
                    ".js"
                ]
            }
        }
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-underscore-dangle": 0,
        "consistent-return": 0,
        "strict": 0, 
        "linebreak-style": [0],
        "space-in-parens": [ "error", "never" ],
        "template-curly-spacing": [ 2, "always" ],
        "array-bracket-spacing": [ 2, "always" ],
        "object-curly-spacing": [ 2, "always" ],
        "computed-property-spacing": [ 2, "always" ],
        "no-multiple-empty-lines": [ 2, { "max": 1, "maxEOF": 0, "maxBOF": 0 } ],
        "no-multi-spaces": [ "error", {
            "exceptions": {
                "ImportDeclaration": true,
                "VariableDeclarator": true,
                "BinaryExpression": true,
                "Property": true,
                "JSXAttribute": true
            }
        }],
        "no-param-reassign": ["error", { "props": false }],
        "no-return-assign": [0],
        "max-len": [1, 120],
        "import/prefer-default-export": 0,
        "no-debugger": 0, 
        "jsx-a11y/href-no-hash": [0],
        "linebreak-style": ["error", "windows"]
    }
};