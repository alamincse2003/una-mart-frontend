const MESSAGES = [
  "Free delivery across Dhaka",
  "Cash on Delivery available",
  "bKash & Nagad accepted",
  "New arrivals every week",
];

export function MarqueeStrip() {
  const track = [...MESSAGES, ...MESSAGES];

  return (
    <div className="overflow-hidden whitespace-nowrap bg-navy-800 py-3">
      <div className="marquee-track inline-flex">
        {track.map((message, i) => (
          <span
            key={i}
            className="px-8 text-sm font-semibold tracking-wide text-navy-100"
          >
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
