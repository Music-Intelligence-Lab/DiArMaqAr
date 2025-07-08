import { Suspense } from "react";
import HomeClient from "./bibliography-client";

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <HomeClient />
    </Suspense>
  );
}
