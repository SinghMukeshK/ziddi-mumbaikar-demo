import sys

def check_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for line_num, line in enumerate(lines, 1):
        for char_num, char in enumerate(line, 1):
            if char == '{':
                stack.append(('{', line_num, char_num))
            elif char == '}':
                if not stack:
                    print(f"Unexpected '}}' at {line_num}:{char_num}")
                else:
                    stack.pop()
            # Note: This is simplified and doesn't handle strings/comments, 
            # but usually suffices to find large structural issues.
    
    if stack:
        print(f"Unclosed braces: {len(stack)}")
        for b, l, c in stack[-5:]:
            print(f"  '{b}' at {l}:{c}")

if __name__ == "__main__":
    check_braces(sys.argv[1])
