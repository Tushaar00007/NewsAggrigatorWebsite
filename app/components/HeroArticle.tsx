type HeroArticleProps = {
  image: string;
  title: string;
};

export default function HeroArticle({ image, title }: HeroArticleProps) {
  return (
    <article className="relative col-span-12 md:col-span-6 row-span-2 h-[450px] group cursor-pointer">
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      {/* Text Content */}
      <div className="absolute bottom-0 left-0 p-6">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white group-hover:underline">
          {title}
        </h2>
      </div>
    </article>
  );
}