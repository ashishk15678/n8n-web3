import { SidebarTrigger } from "../ui/sidebar";
import { SearchComponent } from "./search-component";

export default function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2  px-4 bg-sidebar ">
      <SidebarTrigger />
      <div className="w-full flex shrink   justify-center">
        <SearchComponent />
      </div>
    </header>
  );
}
