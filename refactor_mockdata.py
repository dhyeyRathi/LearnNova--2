import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find mockData import
    import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"](?:\.\./)+data/mockData[\'"];?', content)
    if not import_match:
        import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"](?:\.\./)+(?:\.\./)?data/mockData[\'"];?', content)
        if not import_match:
            return False
            
    imported_vars = import_match.group(1).strip()
    
    # Calculate relative path to DataContext
    parts = filepath.replace('\\', '/').split('/src/app/')[1].split('/')
    depth = len(parts) - 1
    rel_path = '../' * depth + 'context/DataContext' if depth > 0 else './context/DataContext'
    
    # Remove mockData import
    content = content[:import_match.start()] + content[import_match.end():]
    
    # Add useData import
    use_data_import = f"import {{ useData }} from '{rel_path}';\n"
    
    # Insert after last import
    last_import = list(re.finditer(r'^import .*;\n?', content, re.MULTILINE))
    if last_import:
        insert_idx = last_import[-1].end()
        content = content[:insert_idx] + use_data_import + content[insert_idx:]
    else:
        content = use_data_import + content

    # Find the main component function
    # export default function ComponentName() {
    func_match = re.search(r'export default function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{', content)
    if func_match:
        insert_idx = func_match.end()
        hook_call = f"\n  const {{ {imported_vars} }} = useData();"
        content = content[:insert_idx] + hook_call + content[insert_idx:]
    else:
        # Maybe an arrow function export default
        func_match = re.search(r'const\s+[a-zA-Z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{', content)
        if func_match:
            insert_idx = func_match.end()
            hook_call = f"\n  const {{ {imported_vars} }} = useData();"
            content = content[:insert_idx] + hook_call + content[insert_idx:]
        else:
            print(f"Could not find function body for {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Refactored {filepath}")
    return True

base_dir = r"c:\Users\DHYEY RATHI\Desktop\project\LearnNova -2\src\app"
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
