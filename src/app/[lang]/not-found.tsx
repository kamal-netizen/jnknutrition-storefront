import CheckoutNotFound from "./CheckoutNotFound";
import NotFoundContent from "./NotFoundContent";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      {/*
        CheckoutNotFound is a client component that reads window.location at
        runtime. When Shopify bounces a checkout URL back to our domain
        (/cart/c/…), it shows a tailored message instead of the generic 404.
      */}
      <CheckoutNotFound>
        <NotFoundContent />
      </CheckoutNotFound>
    </div>
  );
}
