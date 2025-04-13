import ShopByCategory from "../components/ShopByCategory";
import { getCategories } from "../lib/woocommerce";

export default async function Home() {
  // Fetch categories at the page level
  const categories = await getCategories();
  
  return (
    <div className="min-h-screen">
      {/* Shop By Category Section */}
      <ShopByCategory categories={categories} />
    </div>
  );
}
