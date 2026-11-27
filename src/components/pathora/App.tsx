import { RouterProvider } from "react-router";
import { I18nProvider } from "./app/i18n";
import { JourneyProvider } from "./app/store";
import { router } from "./app/routes";

export default function App() {
  return (
    <JourneyProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </JourneyProvider>
  );
}
