import { Badge } from 'storefront';

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default">New</Badge>
      <Badge variant="secondary">In stock</Badge>
      <Badge variant="destructive">Sold out</Badge>
      <Badge variant="outline">Limited</Badge>
      <Badge variant="ghost">Draft</Badge>
    </div>
  );
}
