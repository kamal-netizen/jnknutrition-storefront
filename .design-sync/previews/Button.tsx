import { Button } from 'storefront';

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="default">Add to cart</Button>
      <Button variant="outline">View details</Button>
      <Button variant="secondary">Save for later</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Remove</Button>
      <Button variant="link">Learn more</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

export function Disabled() {
  return <Button disabled>Add to cart</Button>;
}
