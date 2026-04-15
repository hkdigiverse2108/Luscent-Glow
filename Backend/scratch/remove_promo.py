import os

def remove_promo():
    file_path = 'c:/Users/HP/Downloads/Luscent-Glow/Frontend/src/pages/ProductDetail.tsx'
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # We want to remove lines 589-594 (0-indexed: 588 to 594)
    # 589:             ) : (product.discount && product.discount >= 25) ? (
    # 590:               <div className="bg-gold/10 border border-gold/20 rounded-lg p-3">
    # 591:                 <p className="text-sm font-body text-gold font-medium">
    # 592:                   🎉 Use code <span className="font-bold">EXTRA10</span> for additional 10% off
    # 593:                 </p>
    # 594:               </div>
    # 595:             ) : null}
    
    # We'll replace lines[588:595] with just the falling back 'null}' logic
    
    # Search for the pattern to be safe
    target_start = ') : (product.discount && product.discount >= 25) ? ('
    target_end = ') : null}'
    
    new_lines = []
    skip = False
    for line in lines:
        if target_start in line:
            # We found the start of the block to remove
            # We want to keep the closing part of the previous block if needed, 
            # but here it's ) : ...
            # We replace this line with the fallback
            new_lines.append('            ) : null}\n')
            skip = True
        elif skip and target_end in line:
            skip = False
            # We skip this line too as it's the end of the block we just handled
        elif not skip:
            new_lines.append(line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully removed 'EXTRA10' promo banner from ProductDetail.tsx")

if __name__ == "__main__":
    remove_promo()
