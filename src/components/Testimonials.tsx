import { useState } from "react";
import { Star, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const REVIEWS = [
  {
    name: "Alexandre D.",
    role: "Investisseur",
    content: "Une agence au service exceptionnel. Ils ont trouvé la villa parfaite pour mon investissement à la Palmeraie et gèrent la location avec un professionnalisme rare.",
    rating: 5,
  },
  {
    name: "Sophie et Laurent",
    role: "Expatriés",
    content: "L'accompagnement pour notre installation à Marrakech a été sans faille. Des biens exclusifs qui ne sont même pas sur le marché. Merci à toute l'équipe.",
    rating: 5,
  },
  {
    name: "Karim M.",
    role: "Propriétaire",
    content: "La mise en vente de mon Riad s'est faite avec une grande discrétion et efficacité. Une vraie agence premium qui comprend les codes du luxe.",
    rating: 5,
  },
];

const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Calculate rotation: max 15 degrees tilt
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseEnter = () => setIsHovered(true);
  
  const onMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="w-full h-full" style={{ perspective: "1000px" }}>
      <div
        className={`w-full h-full relative bg-background border border-border/50 p-8 md:p-10 will-change-transform shadow-xl flex flex-col
          ${isHovered ? "transition-none" : "transition-transform duration-500 ease-out"}`}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          transform: isHovered 
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)` 
            : "rotateX(0) rotateY(0) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d"
        }}
      >
        <div style={{ transform: "translateZ(30px)" }} className="flex flex-col flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

const ReviewContent = ({ review }: { review: typeof REVIEWS[0] }) => (
  <>
    <Quote size={40} className="text-foreground/10 absolute top-0 right-0 md:top-6 md:right-6" strokeWidth={1} />
    
    <div className="flex gap-1 mb-6">
      {[...Array(review.rating)].map((_, j) => (
        <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
      ))}
    </div>
    
    <p className="text-muted-foreground font-light text-sm md:text-base leading-relaxed mb-8 italic">
      "{review.content}"
    </p>
    
    <div className="mt-auto pt-4 border-t border-border/30">
      <p className="font-serif text-lg text-foreground">{review.name}</p>
      <p className="text-[10px] tracking-widest uppercase font-sans text-muted-foreground mt-1">
        {review.role}
      </p>
    </div>
  </>
);

const Testimonials = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  
  // Duplicate for smooth infinite mobile marquee
  const mobileReviews = [...REVIEWS, ...REVIEWS];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden bg-secondary/30 reveal-up">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-foreground/[0.02] to-transparent pointer-events-none" />
      <div className="absolute -left-32 top-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10 mb-12 md:mb-20">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">
            Témoignages
          </p>
          <h2 className="max-w-2xl mx-auto">Ils nous font confiance</h2>
        </div>
      </div>

      {/* Desktop Layout: Grid */}
      <div className="hidden md:grid container mx-auto px-12 grid-cols-3 gap-8 lg:gap-12 perspective-container relative z-10">
        {REVIEWS.map((review, i) => (
          <TiltCard key={i}>
            <ReviewContent review={review} />
          </TiltCard>
        ))}
      </div>

      {/* Mobile Layout: Infinite Marquee */}
      <div className="md:hidden w-full overflow-hidden relative z-10">
        {/* Gradients pour fondre les bords sur mobile */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-secondary/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-secondary/50 to-transparent z-10 pointer-events-none" />
        
        <div className="flex w-max animate-marquee py-4">
          {mobileReviews.map((review, i) => (
            <div key={i} className="w-[85vw] sm:w-[60vw] shrink-0 mx-3">
              <TiltCard>
                <ReviewContent review={review} />
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
