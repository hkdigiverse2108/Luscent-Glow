import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: string;
}

/**
 * DynamicIcon renders a Lucide icon based on its string name.
 * @param name - The name of the Lucide icon to render (e.g., "Heart").
 * @param fallback - The name of the fallback icon if the specified icon is not found.
 * @param props - Additional props passed to the Lucide icon component (size, color, etc.).
 */
const DynamicIcon: React.FC<DynamicIconProps> = ({ name, fallback = "HelpCircle", ...props }) => {
  // Access the icon from the LucideIcons object
  const IconComponent = (LucideIcons as any)[name] || (LucideIcons as any)[fallback] || LucideIcons.HelpCircle;

  return <IconComponent {...props} />;
};

export default DynamicIcon;
