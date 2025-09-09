# Быстрый гид по линтингу и форматированию

## 🚀 Основные команды

```bash
# Проверить весь проект
npm run lint

# Исправить все проблемы
npm run lint:fix

# Форматировать код
npm run format

# Проверить форматирование
npm run format:check
```

## 📁 Команды для отдельных частей

```bash
# Backend
npm run lint:backend
npm run lint:fix:backend

# Frontend
npm run lint:frontend
npm run lint:fix:frontend

# Scripts
npm run lint:scripts
npm run lint:fix:scripts
```

## ⚡ Прямое использование конфигуратора

```bash
# Исправить все
node lint.config.mjs fix

# Проверить все
node lint.config.mjs check

# Конкретные файлы
node lint.config.mjs lint "backend/**/*.ts"
node lint.config.mjs format "**/*.md"
```

## 🔧 Файлы конфигурации

- **`eslint.config.mjs`** - ESLint для всего проекта
- **`.prettierrc.json`** - Prettier настройки
- **`lint.config.mjs`** - Единый конфигуратор
- **`.lintstagedrc.cjs`** - Pre-commit хуки

## 💡 Полезные советы

1. **Перед коммитом**: `npm run lint:fix`
2. **Только проверка**: `npm run lint`
3. **Только форматирование**: `npm run format`
4. **IDE настройки**: Включите автоформатирование при сохранении

## 🐛 Если что-то не работает

1. Убедитесь, что все зависимости установлены: `npm install`
2. Проверьте, что файлы не в `.prettierignore`
3. Для детальной диагностики используйте прямые команды ESLint/Prettier

Подробная документация: [LINTING_AND_FORMATTING.md](./LINTING_AND_FORMATTING.md)
