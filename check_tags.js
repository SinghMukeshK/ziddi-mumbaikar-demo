const fs = require('fs');

const content = fs.readFileSync(process.argv[2], 'utf8');
const lines = content.split('\n');
let stack = [];

// Very simple tag parser
const tagRegex = /<\/?([a-zA-Z0-9.]+)(?:\s+[^>]*)?>/g;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    while ((match = tagRegex.exec(line)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];

        if (fullTag.endsWith('/>')) continue; // Self-closing
        if (tagName === 'img' || tagName === 'br' || tagName === 'hr' || tagName === 'input') continue;

        if (fullTag.startsWith('</')) {
            if (stack.length === 0) {
                console.log(`Unexpected closing tag </${tagName}> at line ${i + 1}`);
            } else {
                const last = stack.pop();
                if (last.name !== tagName) {
                    console.log(`Mismatched tag: opened <${last.name}> (line ${last.line}), closed </${tagName}> (line ${i + 1})`);
                }
            }
        } else if (fullTag.startsWith('<')) {
            stack.push({ name: tagName, line: i + 1 });
        }
    }
}

if (stack.length > 0) {
    console.log(`Unclosed tags: ${stack.length}`);
    stack.slice(-10).forEach(s => console.log(`  <${s.name}> at line ${s.line}`));
} else {
    console.log("All tags matched!");
}
