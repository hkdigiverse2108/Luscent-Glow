import re

file_path = r'c:\Users\HP\Downloads\Lucsent_glow\Frontend\src\pages\Admin\AdminBulkOrders.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the select element in features
pattern = r'(\s+)<select\s+value=\{feat\.icon\}[^>]*>.*?<\/select>'
match = re.search(pattern, content, re.DOTALL)

if match:
    indent = match.group(1)
    new_block = f"""{indent}<div className="flex items-center gap-3">
{indent}   <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">
{indent}      <DynamicIcon name={{feat.icon}} size={{18}} />
{indent}   </div>
{indent}   <input 
{indent}     placeholder="Icon (e.g. Layers)"
{indent}     value={{feat.icon}}
{indent}     onChange={{(e) => {{
{indent}       const newFeats = [...config.features];
{indent}       newFeats[i].icon = e.target.value;
{indent}       setConfig({{ ...config, features: newFeats }});
{indent}     }}}}
{indent}     className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
{indent}   />
{indent}</div>"""
    new_content = re.sub(pattern, new_block, content, count=1, flags=re.DOTALL)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement of features select successful")
else:
    print("Features select not found")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the select element in stats
pattern_stats = r'(\s+)<select\s+value=\{stat\.icon\}[^>]*>.*?<\/select>'
match_stats = re.search(pattern_stats, content, re.DOTALL)

if match_stats:
    indent = match_stats.group(1)
    new_block_stats = f"""{indent}<div className="flex items-center gap-3">
{indent}   <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-gold">
{indent}      <DynamicIcon name={{stat.icon}} size={{18}} />
{indent}   </div>
{indent}   <input 
{indent}     placeholder="Icon (e.g. Users)"
{indent}     value={{stat.icon}}
{indent}     onChange={{(e) => {{
{indent}       const newStats = [...config.stats];
{indent}       newStats[i].icon = e.target.value;
{indent}       setConfig({{ ...config, stats: newStats }});
{indent}     }}}}
{indent}     className="bg-transparent border rounded-lg p-2 text-[10px] uppercase font-bold w-24"
{indent}   />
{indent}</div>"""
    new_content = re.sub(pattern_stats, new_block_stats, content, count=1, flags=re.DOTALL)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement of stats select successful")
else:
    print("Stats select not found")
