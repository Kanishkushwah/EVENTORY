const fs = require('fs');
const path = require('path');

const file = '/Users/tanish.kushwah/MAJOR MINOR PROJECT/EVENTHUB/index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Force the grid to items-stretch
content = content.replace(
    'id="eventGrid">',
    'id="eventGrid" style="align-items: stretch;">'
);

// 2. Add min-h-full or a fixed min height to ensure they stretch properly in Safari/Chrome bugs
// Because it's a dynamic replace over many cards, let's just make sure all cards have ' h-full md:h-auto ' or similar.
// Actually, `align-items: stretch;` on the parent usually fixes it perfectly.
// Let's also remove `h-full` from the cards if it exists because that breaks stretch in flex-row in Safari.
content = content.replace(/ h-full /g, ' self-stretch ');

fs.writeFileSync(file, content);
console.log('Fixed flex height stretching issue on mobile.');
