export default function QuickLinks() {
  const links = [
    "NewsNow Summit",
    "NewsNow Good Times",
    "Bihar Elections",
    "Lifestyle",
    "Women's World Cup 2025",
  ];

  return (
    <nav className="bg-gray-800 text-gray-300 px-6 py-2">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold text-white uppercase pr-4 border-r border-gray-600">
          Quick Links
        </span>
        <div className="flex items-center space-x-6 text-sm">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-white transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}