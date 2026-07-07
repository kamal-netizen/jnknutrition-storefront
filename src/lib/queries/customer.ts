import { customerAccountFetch } from "@/lib/customer-account";

// ─── Types (Customer Account API shapes) ──────────────────────────────────────

export type Money = { amount: string; currencyCode: string };

export type CustomerUserError = {
  field: string[] | null;
  message: string;
  code: string | null;
};

export type CustomerAddress = {
  id: string;
  formatted: string[];
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zoneCode: string | null;
  territoryCode: string | null;
  zip: string | null;
  phoneNumber: string | null;
};

export type OrderLineItem = {
  id: string;
  title: string;
  quantity: number;
  variantTitle: string | null;
  price: Money | null;
  image: { url: string; altText: string | null } | null;
};

export type FulfillmentTracking = {
  company: string | null;
  number: string | null;
  url: string | null;
};

export type Fulfillment = {
  status: string;
  trackingInformation: FulfillmentTracking[];
};

export type Order = {
  id: string;
  number: number;
  name: string;
  confirmationNumber: string | null;
  statusPageUrl: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  totalPrice: Money;
  subtotal: Money | null;
  totalTax: Money | null;
  shippingAddress: { name: string | null; formatted: string[] } | null;
  fulfillments: Fulfillment[];
  lineItems: OrderLineItem[];
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  defaultAddress: CustomerAddress | null;
  addresses: CustomerAddress[];
  orders: Order[];
};

export type CustomerAddressInput = {
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zoneCode?: string | null;
  territoryCode?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
};

// ─── GraphQL documents ────────────────────────────────────────────────────────

const ADDRESS_FRAGMENT = `
  fragment Address on CustomerAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    city
    zoneCode
    territoryCode
    zip
    phoneNumber
  }
`;

const GET_CUSTOMER = `
  ${ADDRESS_FRAGMENT}
  query GetCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
      defaultAddress { ...Address }
      addresses(first: 20) { nodes { ...Address } }
      orders(first: 50, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          number
          name
          confirmationNumber
          statusPageUrl
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice { amount currencyCode }
          subtotal { amount currencyCode }
          totalTax { amount currencyCode }
          shippingAddress { name formatted(withName: true) }
          fulfillments(first: 10) {
            nodes {
              status
              trackingInformation { company number url }
            }
          }
          lineItems(first: 100) {
            nodes {
              id
              title
              quantity
              variantTitle
              price { amount currencyCode }
              image { url altText }
            }
          }
        }
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE = `
  ${ADDRESS_FRAGMENT}
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress { ...Address }
      userErrors { field message code }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE = `
  ${ADDRESS_FRAGMENT}
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress { ...Address }
      userErrors { field message code }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE = `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { field message code }
    }
  }
`;

// ─── Raw response shapes ──────────────────────────────────────────────────────

type RawConnection<T> = { nodes: T[] };

type RawOrder = Omit<Order, "fulfillments" | "lineItems"> & {
  fulfillments: RawConnection<Fulfillment>;
  lineItems: RawConnection<OrderLineItem>;
};

type RawCustomer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string | null } | null;
  phoneNumber: { phoneNumber: string | null } | null;
  defaultAddress: CustomerAddress | null;
  addresses: RawConnection<CustomerAddress>;
  orders: RawConnection<RawOrder>;
};

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function getCustomer(
  accessToken: string,
  origin: string
): Promise<Customer | null> {
  const data = await customerAccountFetch<{ customer: RawCustomer | null }>({
    query: GET_CUSTOMER,
    accessToken,
    origin,
  });

  const c = data.customer;
  if (!c) return null;

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.emailAddress?.emailAddress ?? null,
    phone: c.phoneNumber?.phoneNumber ?? null,
    defaultAddress: c.defaultAddress,
    addresses: c.addresses.nodes,
    orders: c.orders.nodes.map((o) => ({
      ...o,
      fulfillments: o.fulfillments.nodes,
      lineItems: o.lineItems.nodes,
    })),
  };
}

export async function createCustomerAddress(
  accessToken: string,
  origin: string,
  address: CustomerAddressInput
): Promise<{ errors: CustomerUserError[] }> {
  const data = await customerAccountFetch<{
    customerAddressCreate: { userErrors: CustomerUserError[] };
  }>({
    query: CUSTOMER_ADDRESS_CREATE,
    variables: { address, defaultAddress: false },
    accessToken,
    origin,
  });
  return { errors: data.customerAddressCreate.userErrors };
}

export async function updateCustomerAddress(
  accessToken: string,
  origin: string,
  addressId: string,
  address: CustomerAddressInput
): Promise<{ errors: CustomerUserError[] }> {
  const data = await customerAccountFetch<{
    customerAddressUpdate: { userErrors: CustomerUserError[] };
  }>({
    query: CUSTOMER_ADDRESS_UPDATE,
    variables: { addressId, address },
    accessToken,
    origin,
  });
  return { errors: data.customerAddressUpdate.userErrors };
}

export async function deleteCustomerAddress(
  accessToken: string,
  origin: string,
  addressId: string
): Promise<{ errors: CustomerUserError[] }> {
  const data = await customerAccountFetch<{
    customerAddressDelete: { userErrors: CustomerUserError[] };
  }>({
    query: CUSTOMER_ADDRESS_DELETE,
    variables: { addressId },
    accessToken,
    origin,
  });
  return { errors: data.customerAddressDelete.userErrors };
}
