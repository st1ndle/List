#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const readline = require('readline');

// ANSI-коды для красивого оформления в терминале
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

// Автоопределение команды Docker: "docker compose" или "docker-compose"
let dockerCmd = 'docker-compose';
try {
  execSync('docker compose version', { stdio: 'ignore' });
  dockerCmd = 'docker compose';
} catch (e) {
  // Откат на docker-compose
}

const menuItems = [
  { text: '🔄 Обновить проект из Git (git pull)', cmd: 'git pull' },
  { text: '🚀 Запустить / Пересобрать всё (rebuild)', cmd: `${dockerCmd} up -d --build` },
  { text: '⚡ Запустить только фронтенд', cmd: `${dockerCmd} up -d --build frontend` },
  { text: '⚙️  Запустить только бэкенд', cmd: `${dockerCmd} up -d --build backend` },
  { text: '🌱 Запустить seed (тестовые данные)', cmd: `${dockerCmd} exec backend npm run seed` },
  { text: '🗑️  Сбросить базу данных (db-reset)', cmd: `${dockerCmd} down -v && ${dockerCmd} up -d` },
  { text: '📋 Посмотреть логи всех контейнеров', cmd: `${dockerCmd} logs -f` },
  { text: '🛑 Остановить все контейнеры', cmd: `${dockerCmd} down` },
  { text: '❌ Выход', cmd: null }
];

let selectedIndex = 0;
let isExecuting = false;

// Настройка ввода с клавиатуры
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Прячем курсор при запуске, показываем при выходе
process.stdout.write('\x1b[?25l');

function cleanupAndExit() {
  process.stdout.write('\x1b[?25h'); // Показываем курсор обратно
  console.clear();
  process.exit(0);
}

function drawMenu() {
  if (isExecuting) return;
  
  console.clear();
  console.log(`${colors.cyan}┌────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.cyan}│${colors.reset} ${colors.bright}ООО ЛиСТ — Панель управления проектом                  ${colors.reset}${colors.cyan}│${colors.reset}`);
  console.log(`${colors.cyan}└────────────────────────────────────────────────────────┘${colors.reset}`);
  console.log(`Используйте клавиши ${colors.cyan}↑ / ↓${colors.reset} или цифры ${colors.cyan}1-${menuItems.length}${colors.reset} для выбора:\n`);

  menuItems.forEach((item, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${colors.green}➔ ` : '  ';
    const num = `${colors.dim}[${index + 1}]${colors.reset}`;
    const text = isSelected 
      ? `${colors.green}${colors.bright}${item.text}${colors.reset}` 
      : item.text;
    console.log(`${prefix} ${num} ${text}`);
  });

  console.log(`\n${colors.gray}Нажмите Enter для запуска или Esc/Ctrl+C для выхода${colors.reset}`);
}

async function runCommand(cmdText) {
  isExecuting = true;
  console.clear();
  console.log(`${colors.cyan}────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.bright}🏃 Выполняется:${colors.reset} ${colors.yellow}${cmdText}${colors.reset}`);
  console.log(`${colors.cyan}────────────────────────────────────────────────────────${colors.reset}\n`);

  // Отключаем raw-режим на время работы команды, чтобы работал стандартный Ctrl+C для прерывания (например, в логах)
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdout.write('\x1b[?25h'); // Показываем курсор

  const shell = process.platform === 'win32' ? true : '/bin/bash';
  
  const child = spawn(cmdText, { 
    stdio: 'inherit', 
    shell: shell 
  });

  child.on('close', (code) => {
    console.log(`\n${colors.cyan}────────────────────────────────────────────────────────${colors.reset}`);
    if (code === 0) {
      console.log(`${colors.green}✅ Команда выполнена успешно!${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Команда завершилась с ошибкой (код ${code}).${colors.reset}`);
    }
    console.log(`${colors.gray}Нажмите любую клавишу для возврата в меню...${colors.reset}`);
    
    // Возвращаем интерактивный режим ввода
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdout.write('\x1b[?25l'); // Скрываем курсор

    process.stdin.once('data', () => {
      isExecuting = false;
      drawMenu();
    });
  });
}

// Обработка нажатий клавиш
process.stdin.on('keypress', (str, key) => {
  if (isExecuting) return;

  // Выход по Ctrl+C или Escape
  if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
    cleanupAndExit();
  }

  // Навигация стрелочками
  if (key.name === 'up') {
    selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
    drawMenu();
  } else if (key.name === 'down') {
    selectedIndex = (selectedIndex + 1) % menuItems.length;
    drawMenu();
  }

  // Выбор по Enter
  if (key.name === 'return') {
    const selected = menuItems[selectedIndex];
    if (selected.cmd === null) {
      cleanupAndExit();
    } else {
      runCommand(selected.cmd);
    }
  }

  // Быстрый выбор по цифрам (1-9)
  const numPressed = parseInt(str, 10);
  if (!isNaN(numPressed) && numPressed >= 1 && numPressed <= menuItems.length) {
    const selected = menuItems[numPressed - 1];
    if (selected.cmd === null) {
      cleanupAndExit();
    } else {
      selectedIndex = numPressed - 1;
      drawMenu();
      runCommand(selected.cmd);
    }
  }
});

// Первый рендер меню
drawMenu();
