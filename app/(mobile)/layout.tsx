import BottomNav from "../_components/BottomNav";
import { FavoritesProvider } from "../_components/FavoritesProvider";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <div className="app">
        {children}
        <BottomNav />
      </div>
    </FavoritesProvider>
  );
}
