"use client";

type NewsCardProps = {
  title: string;
  description: string;
  image: string;
  category: string;
};

export default function NewsCard({
  title,
  description,
  image,
  category,
}: NewsCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1">
      {/* 🖼 Image Section */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) =>
            (e.currentTarget.src =
              "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg")
          }
        />
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full tracking-wide shadow-md">
          {category}
        </span>
      </div>

      {/* 📰 Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            🕓{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <button className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
            Read more →
          </button>
        </div>
      </div>
    </article>
  );
}
