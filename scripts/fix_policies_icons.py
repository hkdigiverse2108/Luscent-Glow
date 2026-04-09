import re

file_path = r'c:\Users\HP\Downloads\Lucsent_glow\Frontend\src\pages\Admin\PoliciesAdmin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the icon section in insights
pattern = r'(\s+)<div className="flex items-center gap-3">(\s+)<div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">.*?<\/div>.*?<\/div>'
# Wait, let's be more specific with the inner parts to match correctly.
pattern = r'(\s+)<div className="flex items-center gap-3">(\s+)<div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">.*?\{resolveIcon\(insight\.icon\)\}.*?<\/div>(\s+)<select.*?<\/select>(\s+)<\/div>'

match = re.search(pattern, content, re.DOTALL)

if match:
    indent = match.group(1)
    new_block = f"""{indent}<div className="flex items-center gap-3">
{indent}  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
{indent}    <DynamicIcon name={{insight.icon}} size={{18}} />
{indent}  </div>
{indent}  <input 
{indent}    placeholder="Icon (e.g. Shield)"
{indent}    value={{insight.icon}}
{indent}    onChange={{(e) => {{
{indent}      const newInsights = [...policy.insights];
{indent}      newInsights[idx].icon = e.target.value;
{indent}      setPolicy({{ ...policy, insights: newInsights }});
{indent}    }}}}
{indent}    className="bg-transparent border rounded-lg p-1 text-[9px] uppercase font-bold w-20"
{indent}  />
{indent}</div>"""
    new_content = re.sub(pattern, new_block, content, count=1, flags=re.DOTALL)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement of PoliciesAdmin icon section successful")
else:
    print("PoliciesAdmin icon section not found exactly")
    # Print a snippet for debugging
    idx = content.find('resolveIcon(insight.icon)')
    if idx != -1:
        print("Found resolveIcon at:", idx)
        print("Snippet:", repr(content[idx-100:idx+100]))
