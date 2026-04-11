import os
import re

files_to_clean = [
    "Frontend/src/pages/About.tsx",
    "Frontend/src/pages/BlogDetail.tsx",
    "Frontend/src/pages/Blogs.tsx",
    "Frontend/src/pages/BulkOrders.tsx",
    "Frontend/src/pages/Cart.tsx",
    "Frontend/src/pages/Checkout.tsx",
    "Frontend/src/pages/Contact.tsx",
    "Frontend/src/pages/FAQ.tsx",
    "Frontend/src/pages/Orders.tsx",
    "Frontend/src/pages/ProductDetail.tsx"
]

def clean_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove import
    content = re.sub(r'import WhatsAppButton from "@/components/WhatsAppButton";\n?', '', content)
    
    # Remove usage (usually <WhatsAppButton />)
    content = re.sub(r'\s*<WhatsAppButton\s*/>', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned {filepath}")

if __name__ == "__main__":
    for f in files_to_clean:
        clean_file(f)
