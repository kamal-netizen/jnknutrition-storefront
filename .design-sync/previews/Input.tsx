import { Input } from 'storefront';

export function Default() {
  return <Input placeholder="Enter your email" style={{ maxWidth: 320 }} />;
}

export function WithValue() {
  return <Input defaultValue="kamal@jnknutrition.com" style={{ maxWidth: 320 }} />;
}

export function Disabled() {
  return <Input placeholder="Disabled" disabled style={{ maxWidth: 320 }} />;
}
