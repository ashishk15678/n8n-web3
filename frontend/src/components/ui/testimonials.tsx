import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

const Testimonials: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      quote:
        "FlowWeb3 has transformed how we manage our DAO operations. What used to take hours of manual work now runs automatically in the background.",
      author: "Alex Rodriguez",
      position: "CTO, MetaDAO",
      rating: 5,
    },
    {
      quote:
        "The visual workflow builder made it easy for our non-technical team to automate complex Web3 processes without writing any code.",
      author: "Sarah Johnson",
      position: "Product Manager, CryptoFlow",
      rating: 5,
    },
    {
      quote:
        "We've increased our DeFi yields by 27% using FlowWeb3's automation tools. The multi-chain support is a game-changer.",
      author: "Michael Chen",
      position: "Founder, YieldMaster",
      rating: 5,
    },
    {
      quote:
        "Setting up cross-chain alerts and automated transactions used to be impossible. Now it's just a few clicks with FlowWeb3.",
      author: "Emma Williams",
      position: "Head of Operations, BlockBridge",
      rating: 4,
    },
  ];

  return (
    <section
      id="testimonials"
      className="section bg-gray-900/50 relative overflow-hidden"
    >
      <div className="absolute -z-10 top-1/3 right-1/4 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="mb-6">
            <span className="gradient-text">Trusted by</span> Web3 Innovators
          </h2>
          <p className="text-gray-300 text-lg">
            See what others are saying about our platform and how it's helping
            them build the future of Web3.
          </p>
        </div>

        <div
          ref={containerRef}
          className="testimonials-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={clsx("testimonials-track", {
              "pause-animation": isHovered,
            })}
          >
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-600" />
                  ))}
                </div>

                <blockquote className="text-lg italic mb-6">
                  "{testimonial.quote}"
                </blockquote>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center text-xl font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
