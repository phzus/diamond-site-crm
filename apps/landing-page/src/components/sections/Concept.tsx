"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Concept() {
  return (
    <section
      id="quem-somos"
      className="relative z-20 -mt-32 pb-[100px] pt-10 lg:-mt-40"
    >
      <div className="container-diamond">
        <div className="flex flex-col-reverse lg:flex-row lg:items-center lg:gap-20 xl:gap-50">

          {/* Conteúdo de Texto (Esquerda) */}
          <div className="flex w-full flex-col items-start lg:w-[46%]">
            {/* Símbolo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 lg:mb-12"
            >
              <Image
                src="/símbolo.svg"
                alt="Símbolo Diamond"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 max-w-lg font-distrample text-4xl font-medium uppercase leading-[0.9] text-white sm:text-5xl lg:mb-12 lg:text-[4rem]"
            >
              O NOVO
              <br />
              CONCEITO DE
              <br />
              ENTRETENIMENTO
            </motion.h2>

            {/* Textos */}
            <div className="space-y-6 text-white/80 lg:space-y-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-helvetica text-lg font-light leading-relaxed"
              >
                Nossa missão é proporcionar momentos inesquecíveis através de uma
                experiência imersiva que une jogo, sabor e música.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="font-helvetica text-lg font-light leading-relaxed"
              >
                A Diamond Poker Club não é apenas uma casa de jogos. É um ecossistema
                completo de lazer, gastronomia e entretenimento de alto padrão
                localizado na orla de Manaíra, o metro quadrado mais valorizado de João
                Pessoa.
              </motion.p>
            </div>
          </div>

          {/* Imagem (Direita) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 relative aspect-[4.5/5] w-full overflow-hidden lg:mb-0 lg:w-1/2"
          >
            <Image
              src="/imagem-quem-somos-entrada-diamond.png"
              alt="Entrada Diamond Poker Club"
              fill
              className="object-cover object-center transition-transform duration-700 hover:scale-105"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
