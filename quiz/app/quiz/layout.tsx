import { ReactNode } from "react";

export default function NestedLayout({ children }: { children: ReactNode }) {
  return (
    <nav>
      {children}
    </nav>
  );
}
