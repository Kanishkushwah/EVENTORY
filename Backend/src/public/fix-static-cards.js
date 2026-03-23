const fs = require('fs');
const path = require('path');

const file = '/Users/tanish.kushwah/MAJOR MINOR PROJECT/EVENTHUB/index.html';
let content = fs.readFileSync(file, 'utf8');

// The class we want to add for mobile swipe cards
const addClasses = ' min-w-[85vw] snap-center shrink-0 md:min-w-0 md:w-auto md:shrink-1';

// Replace each static card wrapper
// We look for 'group flex flex-col h-full border border-gray-100 dark:border-gray-700"'
const targetStr = 'group flex flex-col h-full border border-gray-100 dark:border-gray-700"';
const replaceStr = targetStr.slice(0, -1) + addClasses + '"';

content = content.replace(new RegExp(targetStr, 'g'), replaceStr);

fs.writeFileSync(file, content);
console.log('Fixed static cards flexbox layout overflow issue.');
