// app/page.tsx
import { Suspense } from "react";
import AppClient from "./app-client";

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <AppClient />
    </Suspense>
  );
}
