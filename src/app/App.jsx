import { AppProviders } from "./AppProviders";
import { AppRouter } from "./AppRouter";
import { LegacyTranslationBridge } from "../shared/i18n/LegacyTranslationBridge";

export default function App() {
  return (
    <AppProviders>
      <LegacyTranslationBridge />
      <AppRouter />
    </AppProviders>
  );
}
