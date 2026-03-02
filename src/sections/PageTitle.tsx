interface PageTitleProps {
  title: string;
  sub_title?: string;
  image: string;
}

export default function PageTitle({ title, sub_title, image }: PageTitleProps) {
  return (
    <section
      className="relative z-0 w-full bg-cover bg-no-repeat bg-[center_top] sm:bg-[center_10%] md:bg-[center_20%] lg:bg-[center_15%]"
      style={{ backgroundImage: `url('${image}')` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <h1>{title}</h1>
          {sub_title && (
            <p className="mt-4 text-lg font-medium text-pretty text-white/80 sm:text-xl/8">
              {sub_title}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}