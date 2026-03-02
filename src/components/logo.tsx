import { cn } from "@/lib/utils";

interface LogoProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
}

const Logo = ({ url, children, className }: LogoProps) => {
  const Wrapper = url ? "a" : "div";
  const props = url ? { href: url } : {};

  return (
    <Wrapper {...props} className={cn("flex items-center gap-2", className)}>
      {children}
    </Wrapper>
  );
};

interface LogoImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

const LogoImage = ({ src, alt, title, className }: LogoImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={cn("h-8 w-auto", className)}
    />
  );
};

interface LogoTextProps {
  children: React.ReactNode;
  className?: string;
}

const LogoText = ({ children, className }: LogoTextProps) => {
  return (
    <span className={cn("text-lg font-bold tracking-tight", className)}>
      {children}
    </span>
  );
};

export { Logo, LogoImage, LogoText };
