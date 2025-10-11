import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
}

export const CategoryCard = ({ title, description, image }: CategoryCardProps) => {
  return (
    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-smooth hover:-translate-y-1 border border-border/50 group cursor-pointer bg-card">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480'%3E%3Crect width='640' height='480' fill='%23f5f5dc'/%3E%3Ctext x='320' y='240' font-family='Arial' font-size='24' fill='%238A9B68' text-anchor='middle' dominant-baseline='middle'%3E{title}%3C/text%3E%3C/svg%3E".replace('{title}', title);
          }}
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};