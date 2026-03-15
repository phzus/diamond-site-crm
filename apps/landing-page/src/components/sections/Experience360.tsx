"use client";

import Image from "next/image";
import { Spade, Ticket, Utensils, Martini } from "lucide-react";

const serviceCards = [
  { id: 1, title: "POKER ROOM", icon: Spade },
  { id: 2, title: "ENTRETENIMENTO\nLOTÉRICO\nREGULAMENTADO", icon: Ticket },
  { id: 3, title: "GASTRONOMIA\nPREMIUM", icon: Utensils },
  { id: 4, title: "BAR & MIXOLOGIA", icon: Martini },
];

export function Experience360() {
  return (
    <section id="experiencia-360" className="relative py-20 pb-40 lg:py-[100px] lg:pb-[200px] overflow-hidden">
      {/* Container Pai Principal */}
      <div className="container-diamond relative min-h-[600px] lg:min-h-[800px] flex items-center justify-center">

        {/* 1° Div Filho: Background Element (Absolute no Centro) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* SVGs em ordem de profundidade: 0.1 -> 0.2 -> 0.4 */}
          <Image
            src="/circle-0.1.svg" alt="" width={846} height={846}
            className="absolute w-[120%] lg:w-[780px] z-0"
          />
          <Image
            src="/circle-0.2.svg" alt="" width={724} height={724}
            className="absolute w-[85%] lg:w-[680px] z-10"
          />
          <Image
            src="/circle-0.4.svg" alt="" width={604} height={604}
            className="absolute w-[65%] lg:w-[580px] z-20"
          />

          {/* Texto Centralizado */}
          <h2 className="absolute z-30 text-center font-distrample text-4xl lg:text-[72px] font-medium uppercase leading-[0.9] text-white">
            UMA<br />EXPERIÊNCIA<br />360°
          </h2>
        </div>

        {/* 2° Div Filho: Conteúdo (Grid de 4 Cards) */}
        <div className="relative z-40 w-full grid grid-cols-1 lg:grid-cols-2 gap-y-6 lg:gap-y-[160px] justify-items-center items-start lg:items-stretch auto-rows-auto lg:auto-rows-fr">
          {serviceCards.map((card, index) => (
            /* Card Div Único - No mobile usamos min-h para igualar a altura sem esticar com a margem */
            <div
              key={card.id}
              className={`
                glass-card flex flex-col items-start
                w-full max-w-[280px] lg:max-w-[360px] gap-y-0 lg:gap-y-8
                p-6 lg:p-10 lg:h-full min-h-[200px] lg:min-h-0 justify-between
                ${index % 2 === 0 ? "lg:justify-self-start" : "lg:justify-self-end"}
                ${index === 1 ? "mb-[210px] lg:mb-0" : ""}
              `}
            >
              {/* Ícone */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20">
                <card.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>

              {/* Título do Serviço */}
              <h3 className="font-helvetica text-lg lg:text-2xl font-normal uppercase tracking-wide text-white whitespace-pre-line leading-tight">
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
