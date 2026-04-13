import sys

file_path = r'c:\Users\HP\Downloads\Luscent-Glow\Frontend\src\pages\Admin\AdminUsers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_btn = [
    '                              <button \n',
    '                                 onClick={() => openUserDetails(u, "addresses", false)}\n',
    '                                 title="View Addresses"\n',
    '                                 className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${\n',
    '                                   isDark ? "bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10" : "bg-charcoal/5 text-charcoal/40 hover:text-gold hover:bg-gold/10"\n',
    '                                 }`}\n',
    '                              >\n',
    '                                 <MapPin size={18} />\n',
    '                              </button>\n'
]

# Profile button starts at line 374 (0-indexed 373)
lines.insert(373, "".join(new_btn))

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Modification successful")
