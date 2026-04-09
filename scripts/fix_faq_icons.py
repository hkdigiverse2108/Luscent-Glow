import re

file_path = r'c:\Users\HP\Downloads\Lucsent_glow\Frontend\src\pages\Admin\AdminFAQ.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the select element in categories
pattern = r'(\s+)<select\s+value=\{cat\.icon\}[^>]*>.*?<\/select>'
match = re.search(pattern, content, re.DOTALL)

if match:
    indent = match.group(1)
    new_block = f"""{indent}<div className="flex items-center gap-3">
{indent}   <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
{indent}      <DynamicIcon name={{cat.icon}} size={{14}} />
{indent}   </div>
{indent}   <input 
{indent}      placeholder="Icon Name"
{indent}      value={{cat.icon}}
{indent}      onClick={{(e) => e.stopPropagation()}}
{indent}      onChange={{(e) => {{
{indent}        const newCats = [...config.categories];
{indent}        const idx = newCats.findIndex(c => c.id === cat.id);
{indent}        newCats[idx].icon = e.target.value;
{indent}        setConfig({{ ...config, categories: newCats }});
{indent}      }}}}
{indent}      className="bg-transparent border rounded-lg p-1 text-[9px] uppercase font-bold w-20"
{indent}   />
{indent}</div>"""
    new_content = re.sub(pattern, new_block, content, count=1, flags=re.DOTALL)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement of FAQ categories select successful")
else:
    print("FAQ categories select not found")
