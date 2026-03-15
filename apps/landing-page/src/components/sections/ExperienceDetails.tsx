"use client";

import Image from "next/image";

/**
 * Experience Details Data
 * Based on the 4 Experience 360 categories
 */
const experienceCards = [
  {
    id: 1,
    title: "POKER",
    description:
      "Mesas profissionais para prática de Torneios Diários, atendendo desde iniciantes até jogadores High Stakes organizados pela JPT.",
    backgroundImage: "/bg-card-estutura-1.png",
    logo: "/JPT-logo.svg",
    logoAlt: "JPT Logo",
    textPosition: "left" as const,
    maxWidth: "max-w-md lg:max-w-md", // padrão
  },
  {
    id: 2,
    title: "APOSTAS\nLOTÉRICAS",
    description:
      "Mais de 110 máquinas de última geração para diversão eletrônica.\n\nInspirada nos grandes centros de entretenimento do mundo. Aqui, cada detalhe foi pensado para você viver o extraordinário.",
    secondaryDescription:
      "Segurança Jurídica: Todo o nosso parque de diversão eletrônica (máquinas) é 100% licenciado, auditado e autorizado pela LOTEP. Diversão com transparência e legalidade.",
    backgroundImage: "/bg-card-estutura-2.png",
    logo: "/lotep-logo.svg",
    logoAlt: "LOTEP Logo",
    textPosition: "right" as const,
    maxWidth: "max-w-md lg:max-w-xl", // entre base e lg
  },
  {
    id: 3,
    title: "GASTRONOMIA\nPREMIUM",
    description:
      "Para acompanhar a adrenalina dos jogos, a experiência foi elevada pela gastronomia do renomado HAO. O serviço ofereceu pratos que harmonizaram com a proposta de luxo da casa, garantindo excelência também no paladar.",
    secondaryDescription:
      "Serviço integrado completo de bar e cozinha, oferecendo o melhor da culinária oriental e contemporânea.",
    tertiaryDescription:
      "Nossa cozinha é assinada pelo renomado restaurante HAO, referência em culinária oriental de alto padrão, garantindo que a experiência gastronômica esteja à altura do jogo.",
    backgroundImage: "/bg-card-estutura-3.png",
    logo: "/hao-logo.svg",
    logoAlt: "HAO Logo",
    textPosition: "left" as const,
    maxWidth: "max-w-md lg:max-w-lg", // padrão
  },
  {
    id: 4,
    title: "DIAMOND\nSPORT BAR",
    description:
      "Esqueça o barzinho comum. A Diamond elevou o conceito de assistir aos jogos. Criamos uma arena visual incomparável para você torcer com o máximo de conforto e tecnologia.",
    backgroundImage: "/bg-card-estutura-4.png",
    logo: "/símbolo.svg",
    logoAlt: "Diamond Symbol",
    textPosition: "right" as const,
    maxWidth: "max-w-md lg:max-w-sm", // conforme ajuste do usuário
  },
];

/**
 * Experience Details Section
 * Full-screen sticky cards that reveal content about each Experience 360 category
 */
export function ExperienceDetails() {
  return (
    <section id="experience-details" className="relative">
      {experienceCards.map((card, index) => (
        <div
          key={card.id}
          className={`sticky top-0 h-screen w-full ${index !== 3 ? "mb-[50vh]" : ""}`}
          style={{ zIndex: index + 1 }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={card.backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content Container */}
          <div
            className={`
              container-diamond relative h-full
              flex items-center
              pt-16 lg:pt-20
              ${card.textPosition === "right" ? "justify-end" : "justify-start"}
            `}
          >
            {/* Text Content */}
            <div
              className={`
                ${card.maxWidth}
                ${card.textPosition === "right" ? "text-right" : "text-left"}
              `}
            >
              {/* Logo/Symbol for Diamond Sport Bar */}
              {card.id === 4 && (
                <div className={`mb-8 ${card.textPosition === "right" ? "flex justify-end" : ""}`}>
                  <Image
                    src={card.logo}
                    alt={card.logoAlt}
                    width={24}
                    height={32}
                    className="h-8 w-auto"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="font-distrample text-4xl sm:text-5xl lg:text-[4rem] font-medium uppercase leading-[1.1] text-white whitespace-pre-line mb-8">
                {card.title}
              </h2>

              {/* Primary Description */}
              <p className="font-helvetica text-base lg:text-lg font-light text-white/80 leading-relaxed whitespace-pre-line mb-4">
                {card.description}
              </p>

              {/* Logo LOTEP (before secondary description) */}
              {card.id === 2 && (
                <div className={`my-6 ${card.textPosition === "right" ? "flex justify-end" : ""}`}>
                  <Image
                    src={card.logo}
                    alt={card.logoAlt}
                    width={120}
                    height={48}
                    className="h-12 lg:h-14 w-auto"
                  />
                </div>
              )}

              {/* Secondary Description (if exists) */}
              {card.secondaryDescription && (
                <p className="font-helvetica text-base lg:text-lg font-light text-white/80 leading-relaxed mb-4">
                  {card.secondaryDescription}
                </p>
              )}

              {/* Logo JPT (for card 1 only) */}
              {card.id === 1 && (
                <div className={`mt-6 ${card.textPosition === "right" ? "flex justify-end" : ""}`}>
                  <Image
                    src={card.logo}
                    alt={card.logoAlt}
                    width={120}
                    height={48}
                    className="h-12 lg:h-14 w-auto"
                  />
                </div>
              )}

              {/* Logo HAO (specifically for Gastronomia) */}
              {card.id === 3 && (
                <div className={`my-8 ${card.textPosition === "right" ? "flex justify-end" : ""}`}>
                  <Image
                    src={card.logo}
                    alt={card.logoAlt}
                    width={120}
                    height={48}
                    className="h-12 lg:h-12 w-auto"
                  />
                </div>
              )}

              {/* Tertiary Description (only for Gastronomia) */}
              {card.tertiaryDescription && (
                <p className="font-helvetica text-base lg:text-lg font-light text-white/80 leading-relaxed">
                  {card.tertiaryDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Spacer for scroll effect - allows last card to stay sticky */}
      <div className="h-[50vh]" />
    </section>
  );
}

