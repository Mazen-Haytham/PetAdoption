import { Outlet } from "react-router-dom";
import AdopterShellNav from "../../components/adopterHome/AdopterShellNav";
import PageFooter from "../../components/shared/PageFooter";

/** Wraps adopter home + profile: same shell as the old profile page (nav + footer). */
export default function AdopterBrowseLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AdopterShellNav />
      <div className="flex-1">
        <Outlet />
      </div>
      <PageFooter brand="PawAdopt" />
    </div>
  );
}
