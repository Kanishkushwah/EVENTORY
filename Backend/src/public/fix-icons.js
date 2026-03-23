const fs = require('fs');
const path = require('path');

const dir = '/Users/tanish.kushwah/MAJOR MINOR PROJECT/EVENTHUB';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Fix the fonts googleapis link to include BOTH icon sets
    content = content.replace(
        /https:\/\/fonts\.googleapis\.com\/icon\?family=Material\+Icons(?:(?:%7C|\|)Material\+Icons\+Outlined)?(?:\+Outlined)?/g,
        'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined'
    );

    // Fix the theme-icon class accidentally applying to notifications
    content = content.replace(
        /class="([^"]*)theme-icon([^"]*)">(\s*)notifications(\s*)<\/span>/g,
        'class="$1$2">$3notifications$4</span>'
    );

    // Double check fixing the double space in class list due to removing theme-icon
    content = content.replace(/class="([^"]*)  ([^"]*)">/g, 'class="$1 $2">');

    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Successfully fixed icons in ${file}`);
});
