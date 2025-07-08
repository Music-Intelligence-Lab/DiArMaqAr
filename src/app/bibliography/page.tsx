import { Suspense } from "react";
import BibliographyClient from "./bibliography-client";

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <BibliographyClient />
    </Suspense>
  );
}
