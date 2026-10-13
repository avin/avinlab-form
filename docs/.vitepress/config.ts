import { defineConfig, type DefaultTheme } from 'vitepress';

const sidebar = (p: string, t: Record<string, string>): DefaultTheme.Sidebar => [
  {
    text: t.guide,
    items: [
      { text: t.introduction, link: `${p}/guide/introduction` },
      { text: t.gettingStarted, link: `${p}/guide/getting-started` },
      { text: t.core, link: `${p}/guide/core` },
      { text: t.react, link: `${p}/guide/react` },
      { text: t.validation, link: `${p}/guide/validation` },
      { text: t.generated, link: `${p}/guide/generated-controls` },
    ],
  },
  {
    text: t.reference,
    items: [
      { text: t.api, link: `${p}/reference/api` },
      { text: t.migration, link: `${p}/reference/migration` },
      { text: t.skill, link: `${p}/reference/skill` },
    ],
  },
];

const nav = (p: string, t: Record<string, string>): DefaultTheme.NavItem[] => [
  { text: t.guide, link: `${p}/guide/introduction`, activeMatch: `${p}/guide/` },
  { text: t.reference, link: `${p}/reference/api`, activeMatch: `${p}/reference/` },
  { text: 'npm', link: 'https://www.npmjs.com/package/@avinlab/react-form' },
];

const en = {
  guide: 'Guide',
  introduction: 'Introduction',
  gettingStarted: 'Getting started',
  core: 'Core controller',
  react: 'React',
  validation: 'Validation',
  generated: 'Generated controls',
  reference: 'Reference',
  api: 'API cheat sheet',
  migration: 'Migrating to V5',
  skill: 'Agent skill',
};

const ru = {
  guide: 'Руководство',
  introduction: 'Введение',
  gettingStarted: 'Быстрый старт',
  core: 'Ядро',
  react: 'React',
  validation: 'Валидация',
  generated: 'Генерируемые контролы',
  reference: 'Справочник',
  api: 'Шпаргалка по API',
  migration: 'Миграция на V5',
  skill: 'Навык для агента',
};

export default defineConfig({
  title: 'avinlab-form',
  base: '/avinlab-form/',
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['agents/**'],
  head: [['link', { rel: 'icon', href: '/avinlab-form/favicon.svg' }]],
  themeConfig: {
    logo: '/favicon.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/avin/avinlab-form' }],
    search: {
      provider: 'local',
      options: {
        locales: {
          ru: {
            translations: {
              button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
              modal: {
                displayDetails: 'Показать подробности',
                resetButtonTitle: 'Сбросить запрос',
                backButtonTitle: 'Закрыть поиск',
                noResultsText: 'Ничего не найдено',
                footer: {
                  selectText: 'выбрать',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'перейти',
                  navigateUpKeyAriaLabel: 'стрелка вверх',
                  navigateDownKeyAriaLabel: 'стрелка вниз',
                  closeText: 'закрыть',
                  closeKeyAriaLabel: 'escape',
                },
              },
            },
          },
        },
      },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'Small form controllers for TypeScript and React with readonly snapshots.',
      themeConfig: {
        nav: nav('', en),
        sidebar: sidebar('', en),
        editLink: {
          pattern: 'https://github.com/avin/avinlab-form/edit/master/docs/:path',
          text: 'Edit this page on GitHub',
        },
        footer: { message: 'Released under the MIT License.', copyright: 'Copyright © avin' },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru-RU',
      link: '/ru/',
      description: 'Небольшие контроллеры форм для TypeScript и React с неизменяемыми снимками значений.',
      themeConfig: {
        nav: nav('/ru', ru),
        sidebar: sidebar('/ru', ru),
        editLink: {
          pattern: 'https://github.com/avin/avinlab-form/edit/master/docs/:path',
          text: 'Редактировать страницу на GitHub',
        },
        footer: { message: 'Распространяется по лицензии MIT.', copyright: 'Copyright © avin' },
        outline: { label: 'На этой странице' },
        docFooter: { prev: 'Назад', next: 'Далее' },
        lastUpdated: { text: 'Обновлено' },
        langMenuLabel: 'Язык',
        returnToTopLabel: 'Наверх',
        sidebarMenuLabel: 'Меню',
        darkModeSwitchLabel: 'Тема',
        lightModeSwitchTitle: 'Светлая тема',
        darkModeSwitchTitle: 'Тёмная тема',
      },
    },
  },
});
