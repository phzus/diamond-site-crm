"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";

const carouselImages = [
  "/carousel-images/01.png",
  "/carousel-images/02.png",
  "/carousel-images/03.png",
  "/carousel-images/04.png",
  "/carousel-images/05.png",
  "/carousel-images/06.png",
  "/carousel-images/07.png",
  "/carousel-images/08.png",
];

export function Carousel() {
  return (
    <section
      id="galeria"
      className="w-full bg-black py-[100px]"
      aria-label="Galeria de imagens"
    >
      <Swiper
        modules={[Autoplay]}
        spaceBetween={20}
        slidesPerView="auto" // "auto" allows slides to size themselves, perfecting centering
        centeredSlides={true}
        loop={true}
        speed={4000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            spaceBetween: 30,
          },
          1024: {
            spaceBetween: 40,
          },
        }}
        className="w-full linear-transition"
      >
        {carouselImages.map((src, index) => (
          // SwiperSlide must be auto width to respect the inner content width
          <SwiperSlide key={index} className="!w-auto">
            {/*
              Width is determined by Height (fixed) + Aspect Ratio
              Mobile: h-[400px] * (9/14) ≈ 257px width
              Desktop: h-[500px] * (9/14) ≈ 321px width
            */}
            <div className="relative aspect-[9/14] h-[400px] w-auto overflow-hidden rounded-xl border border-white/10 sm:h-[550px]">
              <Image
                src={src}
                alt={`Imagem galeria ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 640px) 300px, 400px"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
