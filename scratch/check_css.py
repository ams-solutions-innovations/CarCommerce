def check_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    open_braces = 0
    in_comment = False
    i = 0
    errors = []
    
    while i < len(content):
        if not in_comment and content[i:i+2] == '/*':
            in_comment = True
            i += 2
            continue
        if in_comment and content[i:i+2] == '*/':
            in_comment = False
            i += 2
            continue
        if in_comment:
            i += 1
            continue
            
        char = content[i]
        if char == '{':
            open_braces += 1
        elif char == '}':
            open_braces -= 1
            if open_braces < 0:
                errors.append(f"Unexpected closing brace at index {i}")
        i += 1
        
    if open_braces != 0:
        errors.append(f"Mismatched braces! Remaining open: {open_braces}")
    if in_comment:
        errors.append("Unclosed comment at end of file!")
        
    print(f"CSS syntax check for {filepath}: {'PASSED' if not errors else 'FAILED'}")
    for e in errors:
        print("  Error:", e)
    return len(errors) == 0

if __name__ == '__main__':
    import sys
    check_css(sys.argv[1] if len(sys.argv) > 1 else 'css/auctions.css')
