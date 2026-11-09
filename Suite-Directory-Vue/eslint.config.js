import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default [
  {
    // ErrorPage.vue has no <template> and can't be parsed (see CLAUDE.md "Known issues")
    ignores: ['dist/**', 'coverage/**', 'src/components/ErrorPage.vue']
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    }
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } }
  },
  // Formatting is Prettier's job; turn off ESLint rules that would fight it
  prettier
]
