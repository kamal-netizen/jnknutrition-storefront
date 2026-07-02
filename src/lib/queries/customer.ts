import { storefrontFetch } from "@/lib/shopify";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CustomerAccessToken = {
  accessToken: string;
  expiresAt: string;
};

export type CustomerUserError = {
  field: string[] | null;
  message: string;
  code: string;
};

export type CustomerAddress = {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  formatted: string[];
};

export type OrderLineItem = {
  title: string;
  quantity: number;
  variant: {
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
  } | null;
};

export type TrackingInfo = {
  number: string | null;
  url: string | null;
};

export type Fulfillment = {
  trackingCompany: string | null;
  trackingInfo: TrackingInfo[];
};

export type Order = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  totalShippingPrice: { amount: string; currencyCode: string };
  shippingAddress: CustomerAddress | null;
  successfulFulfillments: Fulfillment[] | null;
  lineItems: { edges: { node: OrderLineItem }[] };
};

export type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  defaultAddress: CustomerAddress | null;
  addresses: { edges: { node: CustomerAddress }[] };
  orders: { edges: { node: Order }[] };
};

// ─── Mutations ───────────────────────────────────────────────────────────────

const CUSTOMER_CREATE = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName }
      customerUserErrors { field message code }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message code }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_DELETE = `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors { field message }
    }
  }
`;

const CUSTOMER_UPDATE = `
  mutation CustomerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id email firstName lastName phone }
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message code }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE = `
  mutation CustomerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id address1 address2 city province country zip phone firstName lastName formatted }
      customerUserErrors { field message code }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE = `
  mutation CustomerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress { id address1 address2 city province country zip phone firstName lastName formatted }
      customerUserErrors { field message code }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE = `
  mutation CustomerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors { field message code }
    }
  }
`;

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_CUSTOMER = `
  query GetCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id email firstName lastName phone
      defaultAddress {
        id address1 address2 city province country zip phone firstName lastName formatted
      }
      addresses(first: 10) {
        edges {
          node { id address1 address2 city province country zip phone firstName lastName formatted }
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id orderNumber processedAt financialStatus fulfillmentStatus statusUrl
            currentTotalPrice { amount currencyCode }
            totalShippingPrice { amount currencyCode }
            shippingAddress {
              id address1 address2 city province country zip phone firstName lastName formatted
            }
            successfulFulfillments(first: 5) {
              trackingCompany
              trackingInfo { number url }
            }
            lineItems(first: 50) {
              edges {
                node {
                  title quantity
                  variant {
                    price { amount currencyCode }
                    image { url altText }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function createCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_CREATE, { input });
  return { errors: data.customerCreate.customerUserErrors };
}

export async function createCustomerAccessToken(credentials: {
  email: string;
  password: string;
}): Promise<{ token: CustomerAccessToken | null; errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_ACCESS_TOKEN_CREATE, { input: credentials });
  return {
    token: data.customerAccessTokenCreate.customerAccessToken,
    errors: data.customerAccessTokenCreate.customerUserErrors,
  };
}

export async function deleteCustomerAccessToken(
  accessToken: string
): Promise<void> {
  await storefrontFetch(CUSTOMER_ACCESS_TOKEN_DELETE, {
    customerAccessToken: accessToken,
  });
}

export async function getCustomer(
  customerAccessToken: string
): Promise<Customer | null> {
  const data = await storefrontFetch<{ customer: Customer | null }>(
    GET_CUSTOMER,
    { customerAccessToken }
  );
  return data.customer;
}

export async function updateCustomer(
  customerAccessToken: string,
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }
): Promise<{ errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerUpdate: {
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_UPDATE, { customerAccessToken, customer });
  return { errors: data.customerUpdate.customerUserErrors };
}

export async function createCustomerAddress(
  customerAccessToken: string,
  address: Omit<CustomerAddress, "id" | "formatted">
): Promise<{ errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerAddressCreate: {
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_ADDRESS_CREATE, { customerAccessToken, address });
  return { errors: data.customerAddressCreate.customerUserErrors };
}

export async function updateCustomerAddress(
  customerAccessToken: string,
  id: string,
  address: Omit<CustomerAddress, "id" | "formatted">
): Promise<{ errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerAddressUpdate: {
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_ADDRESS_UPDATE, { customerAccessToken, id, address });
  return { errors: data.customerAddressUpdate.customerUserErrors };
}

export async function deleteCustomerAddress(
  customerAccessToken: string,
  id: string
): Promise<{ errors: CustomerUserError[] }> {
  const data = await storefrontFetch<{
    customerAddressDelete: {
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_ADDRESS_DELETE, { customerAccessToken, id });
  return { errors: data.customerAddressDelete.customerUserErrors };
}
