import re
import os

def audit_directory(src_dir):
    missing_report = []
    
    # Common non-icon components to ignore
    ignored = {
        'AnimatePresence', 'motion', 'Link', 'Outlet', 'Header', 'Footer', 
        'SEO', 'ProductCard', 'ReviewModal', 'CustomerGalleryModal', 
        'AdminHeader', 'AdminLayout', 'AdminThemeProvider', 'Routes', 'Route',
        'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Dialog', 'DialogContent',
        'DialogHeader', 'DialogTitle', 'DialogTrigger', 'DialogFooter', 'Input', 'Label',
        'Button', 'Card', 'CardContent', 'CardHeader', 'CardTitle', 'Select', 'SelectTrigger',
        'SelectValue', 'SelectContent', 'SelectItem', 'Badge', 'ScrollArea', 'Separator',
        'Tooltip', 'TooltipContent', 'TooltipProvider', 'TooltipTrigger', 'LucideIcon',
        'NavigationMenu', 'NavigationMenuList', 'NavigationMenuItem', 'NavigationMenuLink', 'NavigationMenuTrigger', 'NavigationMenuContent',
        'Accordion', 'AccordionItem', 'AccordionTrigger', 'AccordionContent',
        'Image', 'Product', 'User', 'Cart', 'Order', 'Address', 'Category', 'Promotion', 'Review', 'Newsletter', 'Blog', 'Settings', 'LogOut', 'GiftCard', 'Coupon', 'WhatsAppButton', 'LuminaChatBot', 'ScrollToTop', 'Toaster', 'Sonner', 'TooltipProvider', 'AuthProvider', 'QueryClientProvider', 'HelmetProvider', 'BrowserRouter', 'WishlistProvider', 'CartProvider', 'AdminProtectedRoute', 'Navigate', 'BrowserRouter'
    }

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # Find all imports
                imports = set()
                # matches import { a, b as c } from '...'
                import_matches = re.findall(r'import\s+\{([^}]+)\}\s+from', content)
                for block in import_matches:
                    for item in block.split(','):
                        name = item.strip().split(' as ')[-1].strip()
                        if name: imports.add(name)
                
                # matches import Name from '...'
                default_imports = re.findall(r'import\s+([A-Z][a-zA-Z0-9]+)\s+from', content)
                imports.update(default_imports)

                # Find all used capitalized tags
                used_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]+)', content))
                
                missing = []
                for tag in used_tags:
                    if tag not in imports and tag not in ignored:
                        # Final check: is it defined in the same file?
                        if not re.search(r'const\s+' + tag + r'\s*=', content) and \
                           not re.search(r'function\s+' + tag + r'\s*\(', content) and \
                           not re.search(r'class\s+' + tag, content):
                            missing.append(tag)
                
                if missing:
                    missing_report.append(f"{path}: {missing}")
                    
    return missing_report

report = audit_directory('Frontend/src')
for line in report:
    print(line)

