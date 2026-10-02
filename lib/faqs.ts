// FAQ content — plain data (not in the client accordion module) so server
// pages can also render it as FAQPage structured data.
export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "What areas do you deliver to?",
    answer:
      "We deliver across Bangladesh. Delivery is free inside Dhaka, with a flat ৳120 delivery charge for orders outside Dhaka (free on products marked “Free delivery”).",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders inside Dhaka typically arrive within 1–2 business days. Orders outside Dhaka may take 3–5 business days depending on location.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery, bKash and Nagad. Card payments aren't supported yet.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "No. You can check out as a guest with just your name, mobile number and address. We'll call to confirm your order.",
  },
  {
    question: "Can I return an item?",
    answer:
      "Most items can be returned within 7 days of delivery if unused and in original packaging. See our Return Policy for full details and exceptions.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Use the Track Order page with your order number and the mobile number you ordered with.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "Contact our support team within 48 hours of delivery with photos of the item, and we'll arrange a replacement or refund at no extra cost.",
  },
];
