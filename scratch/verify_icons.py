import re
import os

def verify_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r') as f:
        content = f.read()

    # Find lucide-react imports
    lucide_imports = set()
    import_blocks = re.findall(r'import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\']', content, re.MULTILINE)
    for block in import_blocks:
        items = [item.strip().split(' as ')[-1] for item in block.split(',')]
        lucide_imports.update([i for i in items if i])

    # Find all JSX tags <IconName ... />
    used_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]+)', content))
    
    # Common non-icon components to ignore (Project specific)
    ignored = {
        'AnimatePresence', 'motion', 'Link', 'Outlet', 'Header', 'Footer', 
        'SEO', 'ProductCard', 'ReviewModal', 'CustomerGalleryModal', 
        'AdminHeader', 'AdminLayout', 'AdminThemeProvider', 'Routes', 'Route',
        'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Dialog', 'DialogContent',
        'DialogHeader', 'DialogTitle', 'DialogTrigger', 'DialogFooter', 'Input', 'Label',
        'Button', 'Card', 'CardContent', 'CardHeader', 'CardTitle', 'Select', 'SelectTrigger',
        'SelectValue', 'SelectContent', 'SelectItem', 'Badge', 'ScrollArea', 'Separator',
        'Tooltip', 'TooltipContent', 'TooltipProvider', 'TooltipTrigger', 'AdminHeader',
        'NavigationMenu', 'NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuLink', 'NavigationMenuTrigger', 'NavigationMenuContent',
        'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
        'ProductFormModal', 'AdminBrandingModal', 'AdminCategoryModal', 'LogoutConfirmation',
        'Image' # Image can be standard HTML or next/image, but in local context often ImageIcon
    }

    missing = []
    for tag in used_tags:
        if tag not in lucide_imports and tag not in ignored:
            missing.append(tag)

    if missing:
        print(f"!!! MISSING icons in {file_path}: {missing}")
    else:
        print(f"--- {file_path} looks OK (Lucide-wise)")

files = [
    'Frontend/src/pages/Admin/AdminUsers.tsx',
    'Frontend/src/components/Admin/ProductFormModal.tsx',
    'Frontend/src/pages/ProductDetail.tsx',
    'Frontend/src/components/Admin/AdminLayout.tsx',
    'Frontend/src/components/Admin/AdminHeader.tsx',
    'Frontend/src/components/Header.tsx',
    'Frontend/src/components/Footer.tsx'
]

for f in files:
    verify_file(f)

