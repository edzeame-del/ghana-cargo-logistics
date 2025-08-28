interface ResponsiveWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function ResponsiveWrapper({ 
  children, 
  title, 
  description, 
  className = "" 
}: ResponsiveWrapperProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}