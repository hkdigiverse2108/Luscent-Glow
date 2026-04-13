import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-gold/10 rounded-[2rem] max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold">
            <LogOut size={32} />
          </div>
          <AlertDialogTitle className="font-display text-2xl text-center text-charcoal">
            Confirm <span className="text-gold italic font-light">Logout</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center font-body text-sm text-muted-foreground px-4">
            Are you sure you want to logout from your account?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
          <AlertDialogCancel onClick={onClose} className="rounded-full px-6 py-2.5 border-gold/20 text-[10px] font-body font-bold uppercase tracking-widest hover:bg-gold/5 mt-0 sm:mt-0 h-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-full px-6 py-2.5 bg-charcoal text-white hover:bg-gold hover:text-charcoal transition-all text-[10px] font-body font-bold uppercase tracking-widest h-auto"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmation;
