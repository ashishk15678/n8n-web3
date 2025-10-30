import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="flex flex-col w-full h-full items-center justify-center">
        Landing page
        <Link prefetch href={"/workflows"}>
          <Button>Workflows</Button>
        </Link>
      </div>
    </>
  );
}
