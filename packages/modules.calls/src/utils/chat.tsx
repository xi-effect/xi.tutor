export const parseLinks = (message: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const messageParts = message.split(urlRegex);

  return messageParts.map((messagePart, index) => {
    if (urlRegex.test(messagePart)) {
      return (
        <a
          key={index}
          href={messagePart}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-80 hover:text-brand-100 cursor-pointer underline"
          onClick={(e) => e.stopPropagation()}
          data-umami-event="outbound-link-click"
          data-umami-event-url={messagePart}
          data-umami-event-source="chat"
        >
          {messagePart}
        </a>
      );
    }

    return messagePart;
  });
};
