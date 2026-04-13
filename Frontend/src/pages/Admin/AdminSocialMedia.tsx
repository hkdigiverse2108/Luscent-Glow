import React from "react";
import { useAdminTheme } from "../../context/AdminThemeContext.tsx";
import InstagramManagement from "../../components/Admin/InstagramManagement.tsx";
import AdminHeader from "../../components/Admin/AdminHeader.tsx";

const AdminSocialMedia = () => {
  const { isDark } = useAdminTheme();

  return (
    <div className="space-y-6 pb-20">
      <AdminHeader 
        title="Social"
        highlightedWord="Media"
        subtitle="Manage your hand-picked visual stories that define your brand ethos."
        isDark={isDark}
      />
      <div className="mt-8">
        <InstagramManagement />
      </div>
    </div>
  );
};

export default AdminSocialMedia;
