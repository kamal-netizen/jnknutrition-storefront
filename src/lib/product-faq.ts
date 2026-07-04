// Shared, product-agnostic FAQ content. Used both for the visible FAQ section
// on the product page and for the FAQPage structured data (rich results).

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export const PRODUCT_FAQ: ProductFaqItem[] = [
  {
    question: "Are your supplements 100% authentic?",
    answer:
      "Yes. Every product sold by JNK Nutrition is sourced directly from authorised distributors and official brand partners, so you always receive genuine, sealed products.",
  },
  {
    question: "How fast is delivery in the UAE?",
    answer:
      "Orders placed before the daily cut-off are dispatched the same day and typically arrive within 1–3 working days across the UAE. You will receive tracking details as soon as your order ships.",
  },
  {
    question: "Do you offer free shipping?",
    answer:
      "Yes. We offer free shipping on all orders over AED 149. Orders below that qualify for a flat, low delivery fee shown at checkout.",
  },
  {
    question: "Can I pay in instalments?",
    answer:
      "Yes. With Tamara you can split your purchase into 6 payments with no late fees. Simply select Tamara at checkout to see your instalment plan.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "Unopened products in their original packaging can be returned within 7 days of delivery. If an item arrives damaged or incorrect, contact our support team and we will make it right.",
  },
];
