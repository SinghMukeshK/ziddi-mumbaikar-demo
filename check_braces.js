const fs = require('fs');

const content = fs.readFileSync(process.argv[2], 'utf8');
let stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '{') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}') {
            if (stack.length === 0) {
                console.log(`Unexpected } at ${i + 1}:${j + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}

if (stack.length > 0) {
    console.log(`Unclosed braces: ${stack.length}`);
    stack.slice(-10).forEach(s => console.log(`  { at ${s.line}:${s.col}`));
} else {
    console.log("All braces matched!");
}
