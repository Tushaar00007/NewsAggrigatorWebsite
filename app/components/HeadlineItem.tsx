type HeadlineItemProps = {
  image: string;
  title: string;
};

export default function HeadlineItem({ image, title }: HeadlineItemProps) {
  return (
    <a href="#" className="flex items-start space-x-4 group py-3 border-b border-gray-700 last:border-b-0">
      <img src={image} alt={title} className="w-20 h-14 object-cover flex-shrink-0" />
      <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white group-hover:underline">
        {title}
      </h3>
    </a>
  );
}