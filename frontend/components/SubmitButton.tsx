"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import React from "react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  isLoading?: boolean; // For manual control outside forms
}

export default function SubmitButton({ 
  children, 
  loadingText = "Processing...", 
  className = "", 
  isLoading,
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  
  const isPending = isLoading !== undefined ? isLoading : pending;

  return (
    <button
      {...props}
      disabled={isPending || props.disabled}
      className={`${className} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
